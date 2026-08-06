import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  computeElapsedMs,
  msToHoursPlayed,
} from '@/src/lib/liveTimer';
import { useSessions } from '@/src/context/SessionContext';
import {
  addActiveTable,
  clearActiveSession,
  copyTablesToSession,
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
  EndLiveSessionInput,
  StartLiveSessionInput,
} from '@/src/types/liveSession';
import { Session } from '@/src/types/session';

type LiveSessionContextValue = {
  activeSession: ActiveSession | null;
  tables: ActiveTable[];
  elapsedMs: number;
  cumulativePnL: number;
  isLoading: boolean;
  error: string | null;
  startSession: (input: StartLiveSessionInput) => Promise<ActiveSession>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  addTable: (input?: AddTableInput) => Promise<ActiveTable>;
  updateTable: (
    id: string,
    patch: Partial<Pick<ActiveTable, 'name' | 'netResult'>>,
  ) => Promise<void>;
  endSession: (input: EndLiveSessionInput) => Promise<Session>;
  discardSession: () => Promise<void>;
  refresh: () => Promise<void>;
};

// Live session context
const LiveSessionContext = createContext<LiveSessionContextValue | null>(null);

// Live session provider component
export function LiveSessionProvider({ children }: PropsWithChildren) {
  const { addSession, settings } = useSessions();
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(
    null,
  );
  const [tables, setTables] = useState<ActiveTable[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refresh the live session
  const refresh = useCallback(async () => {
    const session = await loadActiveSession();
    setActiveSession(session);
    if (session) {
      const loaded = await loadActiveTables(session.id);
      setTables(loaded);
      setElapsedMs(
        computeElapsedMs({
          accumulatedMs: session.accumulatedMs,
          isPaused: session.isPaused,
          segmentStartedAt: session.segmentStartedAt,
        }),
      );
    } else {
      setTables([]);
      setElapsedMs(0);
    }
  }, []);

  // Refresh the live session on mount
  useEffect(() => {
    refresh()
      .catch(() => setError('Could not load the live session.'))
      .finally(() => setIsLoading(false));
  }, [refresh]);

  // Update the elapsed time every second
  useEffect(() => {
    if (!activeSession || activeSession.isPaused) return;

    const tick = () => {
      setElapsedMs(
        computeElapsedMs({
          accumulatedMs: activeSession.accumulatedMs,
          isPaused: activeSession.isPaused,
          segmentStartedAt: activeSession.segmentStartedAt,
        }),
      );
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeSession]);

  // Start a new live session
  const startSession = useCallback(
    async (input: StartLiveSessionInput) => {
      const session = await startActiveSession({
        location: input.location,
        startingBankroll:
          input.startingBankroll ?? settings.startingBankroll,
      });
      setActiveSession(session);
      setTables([]);
      setElapsedMs(0);
      setError(null);
      return session;
    },
    [settings.startingBankroll],
  );

  // Pause the live session
  const pause = useCallback(async () => {
    if (!activeSession || activeSession.isPaused) return;
    const now = Date.now();
    const accumulated = computeElapsedMs({
      accumulatedMs: activeSession.accumulatedMs,
      isPaused: false,
      segmentStartedAt: activeSession.segmentStartedAt,
      nowMs: now,
    });
    const next: ActiveSession = {
      ...activeSession,
      accumulatedMs: accumulated,
      isPaused: true,
      pausedAt: new Date(now).toISOString(),
      updatedAt: new Date(now).toISOString(),
    };
    await updateActiveSession(next);
    setActiveSession(next);
    setElapsedMs(accumulated);
  }, [activeSession]);

  // Resume the live session
  const resume = useCallback(async () => {
    if (!activeSession || !activeSession.isPaused) return;
    const nowIso = new Date().toISOString();
    const next: ActiveSession = {
      ...activeSession,
      isPaused: false,
      pausedAt: null,
      segmentStartedAt: nowIso,
      updatedAt: nowIso,
    };
    await updateActiveSession(next);
    setActiveSession(next);
  }, [activeSession]);

  // Add a new table to the live session
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

  // Update a table in the live session
  const updateTable = useCallback(
    async (
      id: string,
      patch: Partial<Pick<ActiveTable, 'name' | 'netResult'>>,
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

  // Discard the live session
  const discardSession = useCallback(async () => {
    await clearActiveSession();
    setActiveSession(null);
    setTables([]);
    setElapsedMs(0);
    setError(null);
  }, []);

  // End the live session
  const endSession = useCallback(
    async (input: EndLiveSessionInput) => {
      if (!activeSession) {
        throw new Error('No live session to end.');
      }

      const finalElapsed = computeElapsedMs({
        accumulatedMs: activeSession.accumulatedMs,
        isPaused: activeSession.isPaused,
        segmentStartedAt: activeSession.segmentStartedAt,
      });
      const hoursPlayed = Math.max(0.01, msToHoursPlayed(finalElapsed));
      const location =
        input.location.trim() ||
        activeSession.location.trim() ||
        'Unknown casino';
      const buyIn =
        Number.isFinite(input.buyIn) && input.buyIn >= 0
          ? input.buyIn
          : activeSession.startingBankroll;
      const cashOut = input.cashOut;

      if (!Number.isFinite(cashOut) || cashOut < 0) {
        throw new Error('Enter a valid cash-out amount.');
      }

      const today = new Date().toISOString().slice(0, 10);
      const session = await addSession({
        date: today,
        location,
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
    },
    [activeSession, addSession, tables],
  );

  // Calculate the cumulative PnL of the live session
  const cumulativePnL = useMemo(
    () => tables.reduce((sum, table) => sum + table.netResult, 0),
    [tables],
  );

  // Live session context value
  const value = useMemo(
    () => ({
      activeSession,
      tables,
      elapsedMs,
      cumulativePnL,
      isLoading,
      error,
      startSession,
      pause,
      resume,
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
      isLoading,
      error,
      startSession,
      pause,
      resume,
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

// Live session hook
export function useLiveSession(): LiveSessionContextValue {
  const context = useContext(LiveSessionContext);
  if (!context) {
    throw new Error('useLiveSession must be used inside LiveSessionProvider');
  }
  return context;
}
