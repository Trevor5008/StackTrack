import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Session context value
 * @returns {SessionContextValue}
 * @description This value are used to handle the session context value.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
import {
  defaultSettings,
  loadSessions,
  loadSettings,
  saveSessions,
  saveSettings,
} from '@/src/storage/sessionStore';
import { AppSettings, Session, SessionInput } from '@/src/types/session';

/**
 * Session context value
 * @returns {SessionContextValue}
 * @description This value are used to handle the session context value.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
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

/**
 * Newest first
 * @returns {Session[]}
 * @description This function is used to sort the sessions by the newest first.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
function newestFirst(sessions: Session[]): Session[] {
  return [...sessions].sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime() ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

/**
 * Create id
 * @returns {string}
 * @description This function is used to create a unique id.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Session provider
 * @returns {JSX.Element}
 * @description This component is used to provide the session context.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function SessionProvider({ children }: PropsWithChildren) {
  // sessions to handle the sessions state
  const [sessions, setSessions] = useState<Session[]>([]);
  // settings to handle the settings state
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  // is loading to handle the is loading state
  const [isLoading, setIsLoading] = useState(true);
  // error to handle the error state
  const [error, setError] = useState<string | null>(null);

  // hook to handle page load
  useEffect(() => {
    // promise all to handle the promise all
    Promise.all([loadSessions(), loadSettings()])
      // then set the sessions and settings
      .then(([storedSessions, storedSettings]) => {
        setSessions(newestFirst(storedSessions));
        setSettings(storedSettings);
      })
      // then set the error
      .catch(() => setError('Could not load your saved StackTrack data.'))
      // then set the is loading to false
      .finally(() => setIsLoading(false));
  }, []);

  // persist sessions to handle the persist sessions
  const persistSessions = useCallback(async (next: Session[]) => {
    // sorted to handle the sorted state
    const sorted = newestFirst(next);
    setSessions(sorted);
    // try to save the sessions
    try {
      await saveSessions(sorted);
      setError(null);
    } catch {
      // if the sessions could not be saved, set the error
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
