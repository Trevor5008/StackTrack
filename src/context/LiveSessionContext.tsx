import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useSessions } from '@/src/context/SessionContext';
import {
  assertCanDeleteTable,
  assertCanPlayTable,
  computeElapsedMs,
  findRunningTable,
  msToHoursPlayed,
  sumTableElapsedMs,
} from '@/src/lib/liveTimer';
import {
  assertBettingUnit,
  assertRiskTolerance,
} from '@/src/lib/riskOfRuin';
import {
  assertBudget,
  assertEndingChips,
  assertStake,
  computeRemainingBudget,
  hasOpenStake,
} from '@/src/lib/sessionBudget';
import { parseTableRules } from '@/src/lib/tableRules';
import {
  addActiveTable,
  clearActiveSession,
  copyTablesToSession,
  deleteActiveTable,
  loadActiveSession,
  loadActiveTables,
  startActiveSession,
  updateActiveSession,
  updateActiveTable,
} from '@/src/storage/liveSessionStore';
import {
  ActiveSession,
  ActiveTable,
  AddTableInput,
  StartLiveSessionInput,
} from '@/src/types/liveSession';
import { Session } from '@/src/types/session';

type LiveSessionContextValue = {
  activeSession: ActiveSession | null;
  tables: ActiveTable[];
  elapsedMs: number;
  cumulativePnL: number;
  remainingBudget: number;
  runningTableId: string | null;
  isLoading: boolean;
  error: string | null;
  startSession: (input: StartLiveSessionInput) => Promise<ActiveSession>;
  playTable: (
    id: string,
    stake: number,
    bettingUnit: number,
  ) => Promise<void>;
  pauseTable: (id: string, endingChips: number) => Promise<void>;
  addTable: (input?: AddTableInput) => Promise<ActiveTable>;
  updateTable: (
    id: string,
    patch: Partial<Pick<ActiveTable, 'name' | 'rulesJson'>>,
  ) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;
  endSession: () => Promise<Session>;
  discardSession: () => Promise<void>;
  refresh: () => Promise<void>;
};

const LiveSessionContext = createContext<LiveSessionContextValue | null>(null);

function freezeTableTimer(table: ActiveTable, nowMs: number): ActiveTable {
  if (table.isPaused) return table;
  const accumulated = computeElapsedMs({
    accumulatedMs: table.accumulatedMs,
    isPaused: false,
    segmentStartedAt: table.segmentStartedAt,
    nowMs,
  });
  const nowIso = new Date(nowMs).toISOString();
  return {
    ...table,
    accumulatedMs: accumulated,
    isPaused: true,
    pausedAt: nowIso,
    segmentStartedAt: null,
    updatedAt: nowIso,
  };
}

export function LiveSessionProvider({ children }: PropsWithChildren) {
  const { addSession, settings } = useSessions();
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const [tables, setTables] = useState<ActiveTable[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const session = await loadActiveSession();
    setActiveSession(session);
    if (session) {
      const loaded = await loadActiveTables(session.id);
      setTables(loaded);
      setElapsedMs(sumTableElapsedMs(loaded));
    } else {
      setTables([]);
      setElapsedMs(0);
    }
  }, []);

  useEffect(() => {
    refresh()
      .catch(() => setError('Could not load the live session.'))
      .finally(() => setIsLoading(false));
  }, [refresh]);

  useEffect(() => {
    const anyRunning = tables.some((table) => !table.isPaused);
    if (!anyRunning) {
      setElapsedMs(sumTableElapsedMs(tables));
      return;
    }

    // time duration of the session is the sum of the elapsed time of all tables
    const tick = () => setElapsedMs(sumTableElapsedMs(tables));
    tick();
    const id = setInterval(tick, 1000);
    // clear the interval when the component unmounts
    return () => clearInterval(id);
  }, [tables]);

  // start a new session
  const startSession = useCallback(
    async (input: StartLiveSessionInput) => {
      const startingBankroll =
        input.startingBankroll ?? settings.startingBankroll;
      assertBudget(input.budget, startingBankroll);
      const riskTolerance = assertRiskTolerance(input.riskTolerance);
      const session = await startActiveSession({
        casinoId: input.casinoId,
        startingBankroll,
        budget: input.budget,
        riskTolerance,
      });
      setActiveSession(session);
      setTables([]);
      setElapsedMs(0);
      setError(null);
      return session;
    },
    [settings.startingBankroll],
  );

  // Pause the table timer and update the session budget based on results
  const pauseTable = useCallback(
    async (id: string, endingChips: number) => {
      if (!activeSession) {
        throw new Error('No live session in progress.');
      }
      // validate the ending chips
      assertEndingChips(endingChips);
      // find the table
      const current = tables.find((table) => table.id === id);
      // if the table is not found or is already paused, return
      if (!current || current.isPaused) return;
      if (current.stake <= 0) {
        throw new Error('This table has no stake to settle.');
      }

      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();
      const segmentNet = endingChips - current.stake;
      const nextTable: ActiveTable = {
        ...freezeTableTimer(current, nowMs),
        netResult: current.netResult + segmentNet,
        stake: 0,
        updatedAt: nowIso,
      };
      const nextTables = tables.map((table) =>
        table.id === id ? nextTable : table,
      );
      const remainingBudget = computeRemainingBudget(
        activeSession.buyIn,
        nextTables,
      );
      const nextSession: ActiveSession = {
        ...activeSession,
        remainingBudget,
        updatedAt: nowIso,
      };

      await updateActiveTable(nextTable);
      await updateActiveSession(nextSession);
      setTables(nextTables);
      setActiveSession(nextSession);
      setElapsedMs(sumTableElapsedMs(nextTables, nowMs));
      setError(null);
    },
    [activeSession, tables],
  );

  // Play a table and update the session budget based on results
  const playTable = useCallback(
    async (id: string, stake: number, bettingUnit: number) => {
      if (!activeSession) {
        throw new Error('No live session in progress.');
      }
      // validate the table
      assertCanPlayTable(tables, id);
      // validate the stake
      const available = computeRemainingBudget(activeSession.buyIn, tables);
      assertStake(stake, available);
      const current = tables.find((table) => table.id === id);
      if (!current) return;
      if (!current.isPaused) return;

      const rules = parseTableRules(current.rulesJson);
      if (!rules) {
        throw new Error('Set table rules before playing.');
      }
      assertBettingUnit(bettingUnit, rules.minimumBet);

      const nowIso = new Date().toISOString();
      const nextTable: ActiveTable = {
        ...current,
        stake,
        bettingUnit,
        isPaused: false,
        pausedAt: null,
        segmentStartedAt: nowIso,
        updatedAt: nowIso,
      };
      const nextTables = tables.map((table) =>
        table.id === id ? nextTable : table,
      );
      const remainingBudget = computeRemainingBudget(
        activeSession.buyIn,
        nextTables,
      );
      const nextSession: ActiveSession = {
        ...activeSession,
        remainingBudget,
        updatedAt: nowIso,
      };

      await updateActiveTable(nextTable);
      await updateActiveSession(nextSession);
      setTables(nextTables);
      setActiveSession(nextSession);
      setError(null);
    },
    [activeSession, tables],
  );

  const addTable = useCallback(
    async (input: AddTableInput = { name: '' }) => {
      if (!activeSession) {
        throw new Error('Start a live session before adding tables.');
      }
      const table = await addActiveTable(activeSession.id, input);
      setTables((prev) => [...prev, table]);
      return table;
    },
    [activeSession],
  );

  const updateTable = useCallback(
    async (
      id: string,
      patch: Partial<Pick<ActiveTable, 'name' | 'rulesJson'>>,
    ) => {
      const current = tables.find((table) => table.id === id);
      if (!current) return;
      const next: ActiveTable = {
        ...current,
        ...patch,
        name: patch.name?.trim() ? patch.name.trim() : current.name,
        updatedAt: new Date().toISOString(),
      };
      await updateActiveTable(next);
      setTables((prev) => prev.map((table) => (table.id === id ? next : table)));
    },
    [tables],
  );

  const deleteTable = useCallback(
    async (id: string) => {
      if (!activeSession) {
        throw new Error('No live session in progress.');
      }
      const current = tables.find((table) => table.id === id);
      if (!current) return;
      assertCanDeleteTable(current);

      await deleteActiveTable(id);
      const nextTables = tables.filter((table) => table.id !== id);
      const remainingBudget = computeRemainingBudget(
        activeSession.buyIn,
        nextTables,
      );
      const nowIso = new Date().toISOString();
      const nextSession: ActiveSession = {
        ...activeSession,
        remainingBudget,
        updatedAt: nowIso,
      };
      await updateActiveSession(nextSession);
      setTables(nextTables);
      setActiveSession(nextSession);
      setElapsedMs(sumTableElapsedMs(nextTables));
      setError(null);
    },
    [activeSession, tables],
  );

  const discardSession = useCallback(async () => {
    await clearActiveSession();
    setActiveSession(null);
    setTables([]);
    setElapsedMs(0);
    setError(null);
  }, []);

  const endSession = useCallback(async () => {
    if (!activeSession) {
      throw new Error('No live session to end.');
    }
    if (!activeSession.casinoId) {
      throw new Error('Live session is missing a casino.');
    }
    if (hasOpenStake(tables) || tables.some((table) => !table.isPaused)) {
      throw new Error('Pause every table and enter results before ending.');
    }

    const nowMs = Date.now();
    const hoursPlayed = Math.max(
      0.01,
      msToHoursPlayed(sumTableElapsedMs(tables, nowMs)),
    );
    const buyIn = activeSession.buyIn;
    const cashOut = computeRemainingBudget(buyIn, tables);

    const today = new Date().toISOString().slice(0, 10);
    const session = await addSession({
      date: today,
      location: activeSession.location.trim() || 'Unknown casino',
      casinoId: activeSession.casinoId,
      startingBankroll: activeSession.startingBankroll,
      buyIn,
      cashOut,
      hoursPlayed,
      notes: undefined,
    });

    await copyTablesToSession(session.id, tables);
    await clearActiveSession();
    setActiveSession(null);
    setTables([]);
    setElapsedMs(0);
    setError(null);
    return session;
  }, [activeSession, addSession, tables]);

  const cumulativePnL = useMemo(
    () => tables.reduce((sum, table) => sum + table.netResult, 0),
    [tables],
  );

  const remainingBudget = useMemo(() => {
    if (!activeSession) return 0;
    return computeRemainingBudget(activeSession.buyIn, tables);
  }, [activeSession, tables]);

  const runningTableId = useMemo(
    () => findRunningTable(tables)?.id ?? null,
    [tables],
  );

  const value = useMemo(
    () => ({
      activeSession,
      tables,
      elapsedMs,
      cumulativePnL,
      remainingBudget,
      runningTableId,
      isLoading,
      error,
      startSession,
      playTable,
      pauseTable,
      addTable,
      updateTable,
      deleteTable,
      endSession,
      discardSession,
      refresh,
    }),
    [
      activeSession,
      tables,
      elapsedMs,
      cumulativePnL,
      remainingBudget,
      runningTableId,
      isLoading,
      error,
      startSession,
      playTable,
      pauseTable,
      addTable,
      updateTable,
      deleteTable,
      endSession,
      discardSession,
      refresh,
    ],
  );

  return (
    <LiveSessionContext.Provider value={value}>
      {children}
    </LiveSessionContext.Provider>
  );
}

// Custom hook to access the live session context
export function useLiveSession(): LiveSessionContextValue {
  const context = useContext(LiveSessionContext);
  if (!context) {
    throw new Error('useLiveSession must be used inside LiveSessionProvider');
  }
  return context;
}
