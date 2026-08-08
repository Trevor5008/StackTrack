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
  assertCanPlayTable,
  computeElapsedMs,
  findRunningTable,
  msToHoursPlayed,
  sumTableElapsedMs,
} from '@/src/lib/liveTimer';
import {
  addActiveTable,
  clearActiveSession,
  copyTablesToSession,
  loadActiveSession,
  loadActiveTables,
  startActiveSession,
  updateActiveTable,
} from '@/src/storage/liveSessionStore';
import {
  ActiveSession,
  ActiveTable,
  AddTableInput,
  EndLiveSessionInput,
  StartLiveSessionInput,
} from '@/src/types/liveSession';
import { Session } from '@/src/types/session';

type LiveSessionContextValue = {
  activeSession: ActiveSession | null;
  tables: ActiveTable[];
  elapsedMs: number;
  cumulativePnL: number;
  runningTableId: string | null;
  isLoading: boolean;
  error: string | null;
  startSession: (input: StartLiveSessionInput) => Promise<ActiveSession>;
  /** Pause the currently running table (banner control). */
  pause: () => Promise<void>;
  /** Resume the last paused table when exactly one was running before — uses play on none; prefer playTable. */
  resume: () => Promise<void>;
  playTable: (id: string) => Promise<void>;
  pauseTable: (id: string) => Promise<void>;
  addTable: (input?: AddTableInput) => Promise<ActiveTable>;
  updateTable: (
    id: string,
    patch: Partial<Pick<ActiveTable, 'name' | 'netResult' | 'rulesJson'>>,
  ) => Promise<void>;
  endSession: (input: EndLiveSessionInput) => Promise<Session>;
  discardSession: () => Promise<void>;
  refresh: () => Promise<void>;
};

const LiveSessionContext = createContext<LiveSessionContextValue | null>(null);

function freezeTable(table: ActiveTable, nowMs: number): ActiveTable {
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
  /** Table to resume from banner when all paused after a pause. */
  const [lastPausedTableId, setLastPausedTableId] = useState<string | null>(
    null,
  );

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

    const tick = () => setElapsedMs(sumTableElapsedMs(tables));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tables]);

  const startSession = useCallback(
    async (input: StartLiveSessionInput) => {
      const session = await startActiveSession({
        casinoId: input.casinoId,
        startingBankroll:
          input.startingBankroll ?? settings.startingBankroll,
      });
      setActiveSession(session);
      setTables([]);
      setElapsedMs(0);
      setLastPausedTableId(null);
      setError(null);
      return session;
    },
    [settings.startingBankroll],
  );

  const pauseTable = useCallback(
    async (id: string) => {
      const current = tables.find((table) => table.id === id);
      if (!current || current.isPaused) return;
      const nowMs = Date.now();
      const next = freezeTable(current, nowMs);
      await updateActiveTable(next);
      setTables((prev) => prev.map((table) => (table.id === id ? next : table)));
      setLastPausedTableId(id);
      setElapsedMs(sumTableElapsedMs(
        tables.map((table) => (table.id === id ? next : table)),
        nowMs,
      ));
      setError(null);
    },
    [tables],
  );

  const playTable = useCallback(
    async (id: string) => {
      assertCanPlayTable(tables, id);
      const current = tables.find((table) => table.id === id);
      if (!current) return;
      if (!current.isPaused) return;

      const nowIso = new Date().toISOString();
      const next: ActiveTable = {
        ...current,
        isPaused: false,
        pausedAt: null,
        segmentStartedAt: nowIso,
        updatedAt: nowIso,
      };
      await updateActiveTable(next);
      setTables((prev) => prev.map((table) => (table.id === id ? next : table)));
      setLastPausedTableId(null);
      setError(null);
    },
    [tables],
  );

  const pause = useCallback(async () => {
    const running = findRunningTable(tables);
    if (!running) return;
    await pauseTable(running.id);
  }, [tables, pauseTable]);

  const resume = useCallback(async () => {
    if (findRunningTable(tables)) return;
    const targetId =
      lastPausedTableId && tables.some((t) => t.id === lastPausedTableId)
        ? lastPausedTableId
        : tables[0]?.id;
    if (!targetId) return;
    try {
      await playTable(targetId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Could not resume table timer.',
      );
    }
  }, [tables, lastPausedTableId, playTable]);

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
      patch: Partial<Pick<ActiveTable, 'name' | 'netResult' | 'rulesJson'>>,
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

  const discardSession = useCallback(async () => {
    await clearActiveSession();
    setActiveSession(null);
    setTables([]);
    setElapsedMs(0);
    setLastPausedTableId(null);
    setError(null);
  }, []);

  const endSession = useCallback(
    async (input: EndLiveSessionInput) => {
      if (!activeSession) {
        throw new Error('No live session to end.');
      }

      const nowMs = Date.now();
      const frozen = tables.map((table) => freezeTable(table, nowMs));
      for (let i = 0; i < tables.length; i += 1) {
        if (!tables[i].isPaused) {
          await updateActiveTable(frozen[i]);
        }
      }

      const finalElapsed = sumTableElapsedMs(frozen, nowMs);
      const hoursPlayed = Math.max(0.01, msToHoursPlayed(finalElapsed));
      const buyIn =
        Number.isFinite(input.buyIn) && input.buyIn >= 0
          ? input.buyIn
          : activeSession.startingBankroll;
      const cashOut = input.cashOut;

      if (!activeSession.casinoId) {
        throw new Error('Live session is missing a casino.');
      }
      if (!Number.isFinite(cashOut) || cashOut < 0) {
        throw new Error('Enter a valid cash-out amount.');
      }

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

      await copyTablesToSession(session.id, frozen);
      await clearActiveSession();
      setActiveSession(null);
      setTables([]);
      setElapsedMs(0);
      setLastPausedTableId(null);
      setError(null);
      return session;
    },
    [activeSession, addSession, tables],
  );

  const cumulativePnL = useMemo(
    () => tables.reduce((sum, table) => sum + table.netResult, 0),
    [tables],
  );

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
      runningTableId,
      isLoading,
      error,
      startSession,
      pause,
      resume,
      playTable,
      pauseTable,
      addTable,
      updateTable,
      endSession,
      discardSession,
      refresh,
    }),
    [
      activeSession,
      tables,
      elapsedMs,
      cumulativePnL,
      runningTableId,
      isLoading,
      error,
      startSession,
      pause,
      resume,
      playTable,
      pauseTable,
      addTable,
      updateTable,
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

export function useLiveSession(): LiveSessionContextValue {
  const context = useContext(LiveSessionContext);
  if (!context) {
    throw new Error('useLiveSession must be used inside LiveSessionProvider');
  }
  return context;
}
