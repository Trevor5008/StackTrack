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
  addCasino as addCasinoRecord,
  deleteCasino as deleteCasinoRecord,
  loadCasinos,
  renameCasino as renameCasinoRecord,
} from '@/src/storage/casinoStore';
import {
  clearAllData as clearAllStoredData,
  clearSessions as clearStoredSessions,
  defaultSettings,
  loadSessions,
  loadSettings,
  saveSessions,
  saveSettings,
  seedDemoSessions,
} from '@/src/storage/sessionStore';
import { assertSessionInput } from '@/src/storage/validators';
import { Casino } from '@/src/types/casino';
import { AppSettings, Session, SessionInput } from '@/src/types/session';

type SessionContextValue = {
  sessions: Session[];
  casinos: Casino[];
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  addSession: (input: SessionInput) => Promise<Session>;
  updateSession: (id: string, input: SessionInput) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  addCasino: (name: string) => Promise<Casino>;
  renameCasino: (id: string, name: string) => Promise<Casino>;
  deleteCasino: (id: string) => Promise<void>;
  refreshCasinos: () => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  seedDemoData: () => Promise<void>;
  clearSessions: () => Promise<void>;
  clearAllData: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function newestFirst(sessions: Session[]): Session[] {
  return [...sessions].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function combineWarnings(
  sessionWarning: string | null,
  settingsWarning: string | null,
): string | null {
  const parts = [sessionWarning, settingsWarning].filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCasinos = useCallback(async () => {
    const loaded = await loadCasinos();
    setCasinos(loaded);
  }, []);

  useEffect(() => {
    Promise.all([loadSessions(), loadSettings(), loadCasinos()])
      .then(([storedSessions, storedSettings, loadedCasinos]) => {
        setSessions(newestFirst(storedSessions.sessions));
        setSettings(storedSettings.settings);
        setCasinos(loadedCasinos);
        setError(
          combineWarnings(storedSessions.warning, storedSettings.warning),
        );
      })
      .catch(() => setError('Could not load your saved StackTrack data.'))
      .finally(() => setIsLoading(false));
  }, []);

  const persistSessions = useCallback(
    async (next: Session[], previous: Session[]) => {
      const sorted = newestFirst(next);
      setSessions(sorted);
      try {
        await saveSessions(sorted);
        setError(null);
      } catch {
        setSessions(previous);
        setError('Your latest change could not be saved.');
        throw new Error('Failed to persist sessions');
      }
    },
    [],
  );

  const addSession = useCallback(
    async (input: SessionInput) => {
      const validated = assertSessionInput(input);
      const timestamp = new Date().toISOString();
      const session: Session = {
        ...validated,
        id: createId(),
        netResult: validated.cashOut - validated.buyIn,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await persistSessions([session, ...sessions], sessions);
      return session;
    },
    [persistSessions, sessions],
  );

  const updateSession = useCallback(
    async (id: string, input: SessionInput) => {
      const validated = assertSessionInput(input);
      const next = sessions.map((session) =>
        session.id === id
          ? {
              ...session,
              ...validated,
              netResult: validated.cashOut - validated.buyIn,
              updatedAt: new Date().toISOString(),
            }
          : session,
      );
      await persistSessions(next, sessions);
    },
    [persistSessions, sessions],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await persistSessions(
        sessions.filter((session) => session.id !== id),
        sessions,
      );
    },
    [persistSessions, sessions],
  );

  const addCasino = useCallback(
    async (name: string) => {
      const casino = await addCasinoRecord(name);
      // Optimistic update so navigation to /casino/[id] sees the row immediately.
      setCasinos((current) => {
        if (current.some((item) => item.id === casino.id)) return current;
        return [...current, casino].sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
        );
      });
      return casino;
    },
    [],
  );

  const renameCasino = useCallback(async (id: string, name: string) => {
    const casino = await renameCasinoRecord(id, name);
    setCasinos((current) =>
      current
        .map((item) => (item.id === id ? casino : item))
        .sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
        ),
    );
    setSessions((current) =>
      current.map((session) =>
        session.casinoId === id
          ? { ...session, location: casino.name }
          : session,
      ),
    );
    return casino;
  }, []);

  const deleteCasino = useCallback(async (id: string) => {
    await deleteCasinoRecord(id);
    setCasinos((current) => current.filter((item) => item.id !== id));
    setSessions((current) =>
      current.filter((session) => session.casinoId !== id),
    );
  }, []);

  const updateSettings = useCallback(
    async (next: AppSettings) => {
      const previous = settings;
      setSettings(next);
      try {
        await saveSettings(next);
        setError(null);
      } catch {
        setSettings(previous);
        setError('Your settings could not be saved.');
        throw new Error('Failed to persist settings');
      }
    },
    [settings],
  );

  const seedDemoData = useCallback(async () => {
    const previous = sessions;
    const previousCasinos = casinos;
    try {
      const demos = await seedDemoSessions();
      setSessions(newestFirst(demos));
      await refreshCasinos();
      setError(null);
    } catch {
      setSessions(previous);
      setCasinos(previousCasinos);
      setError('Demo data could not be loaded.');
      throw new Error('Failed to seed demo data');
    }
  }, [sessions, casinos, refreshCasinos]);

  const clearSessions = useCallback(async () => {
    const previous = sessions;
    setSessions([]);
    try {
      await clearStoredSessions();
      setError(null);
    } catch {
      setSessions(previous);
      setError('Sessions could not be cleared.');
      throw new Error('Failed to clear sessions');
    }
  }, [sessions]);

  const clearAllData = useCallback(async () => {
    const previousSessions = sessions;
    const previousCasinos = casinos;
    const previousSettings = settings;
    setSessions([]);
    setCasinos([]);
    setSettings(defaultSettings);
    try {
      await clearAllStoredData();
      setError(null);
    } catch {
      setSessions(previousSessions);
      setCasinos(previousCasinos);
      setSettings(previousSettings);
      setError('Data could not be cleared.');
      throw new Error('Failed to clear all data');
    }
  }, [sessions, casinos, settings]);

  const value = useMemo(
    () => ({
      sessions,
      casinos,
      settings,
      isLoading,
      error,
      addSession,
      updateSession,
      deleteSession,
      addCasino,
      renameCasino,
      deleteCasino,
      refreshCasinos,
      updateSettings,
      seedDemoData,
      clearSessions,
      clearAllData,
    }),
    [
      sessions,
      casinos,
      settings,
      isLoading,
      error,
      addSession,
      updateSession,
      deleteSession,
      addCasino,
      renameCasino,
      deleteCasino,
      refreshCasinos,
      updateSettings,
      seedDemoData,
      clearSessions,
      clearAllData,
    ],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessions(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessions must be used inside SessionProvider');
  }
  return context;
}
