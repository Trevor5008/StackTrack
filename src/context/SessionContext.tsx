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
  defaultSettings,
  loadSessions,
  loadSettings,
  saveSessions,
  saveSettings,
} from '@/src/storage/sessionStore';
import { AppSettings, Session, SessionInput } from '@/src/types/session';

type SessionContextValue = {
  sessions: Session[];
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  addSession: (input: SessionInput) => Promise<Session>;
  updateSession: (id: string, input: SessionInput) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
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

export function SessionProvider({ children }: PropsWithChildren) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadSessions(), loadSettings()])
      .then(([storedSessions, storedSettings]) => {
        setSessions(newestFirst(storedSessions));
        setSettings(storedSettings);
      })
      .catch(() => setError('Could not load your saved StackTrack data.'))
      .finally(() => setIsLoading(false));
  }, []);

  const persistSessions = useCallback(async (next: Session[]) => {
    const sorted = newestFirst(next);
    setSessions(sorted);
    try {
      await saveSessions(sorted);
      setError(null);
    } catch {
      setError('Your latest change could not be saved.');
      throw new Error('Failed to persist sessions');
    }
  }, []);

  const addSession = useCallback(
    async (input: SessionInput) => {
      const timestamp = new Date().toISOString();
      const session: Session = {
        ...input,
        id: createId(),
        netResult: input.cashOut - input.buyIn,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      await persistSessions([session, ...sessions]);
      return session;
    },
    [persistSessions, sessions],
  );

  const updateSession = useCallback(
    async (id: string, input: SessionInput) => {
      const next = sessions.map((session) =>
        session.id === id
          ? {
              ...session,
              ...input,
              netResult: input.cashOut - input.buyIn,
              updatedAt: new Date().toISOString(),
            }
          : session,
      );
      await persistSessions(next);
    },
    [persistSessions, sessions],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await persistSessions(sessions.filter((session) => session.id !== id));
    },
    [persistSessions, sessions],
  );

  const updateSettings = useCallback(async (next: AppSettings) => {
    setSettings(next);
    try {
      await saveSettings(next);
      setError(null);
    } catch {
      setError('Your settings could not be saved.');
      throw new Error('Failed to persist settings');
    }
  }, []);

  const value = useMemo(
    () => ({
      sessions,
      settings,
      isLoading,
      error,
      addSession,
      updateSession,
      deleteSession,
      updateSettings,
    }),
    [
      sessions,
      settings,
      isLoading,
      error,
      addSession,
      updateSession,
      deleteSession,
      updateSettings,
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
