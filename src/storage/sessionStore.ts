import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Session store
 * @returns {JSX.Element}
 * @description This component is used to store the sessions.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
import { sampleSessions } from '@/src/data/sampleSessions';
import { AppSettings, Session } from '@/src/types/session';

/**
 * Sessions key
 * @returns {string}
 * @description This constant is used to store the sessions key.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
const SESSIONS_KEY = '@stacktrack/sessions';
/**
 * Settings key
 * @returns {string}
 * @description This constant is used to store the settings key.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
const SETTINGS_KEY = '@stacktrack/settings';

/**
 * Default settings
 * @returns {AppSettings}
 * @description This constant is used to store the default settings.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export const defaultSettings: AppSettings = {
  // starting bankroll to handle the starting bankroll
  startingBankroll: 5000,
  // currency to handle the currency
  currency: 'USD',
};

/**
 * Load sessions
 * @returns {Promise<Session[]>}
 * @description This function is used to load the sessions.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export async function loadSessions(): Promise<Session[]> {
  // value to handle the value state
  const value = await AsyncStorage.getItem(SESSIONS_KEY);
  // if the value is not null, return the value
  if (value) return JSON.parse(value) as Session[];

  // save the sample sessions
  await saveSessions(sampleSessions);
  // return the sample sessions
  return sampleSessions;
}

/**
 * Save sessions
 * @param {Session[]} sessions
 * @returns {Promise<void>}
 * @description This function is used to save the sessions.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export async function saveSessions(sessions: Session[]): Promise<void> {
  // save the sessions
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

/**
 * Load settings
 * @returns {Promise<AppSettings>}
 * @description This function is used to load the settings.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export async function loadSettings(): Promise<AppSettings> {
  // value to handle the value state
  const value = await AsyncStorage.getItem(SETTINGS_KEY);
  // if the value is not null, return the value
  if (value) return JSON.parse(value) as AppSettings;

  // save the default settings
  await saveSettings(defaultSettings);
  // return the default settings
  return defaultSettings;
}

/**
 * Save settings
 * @param {AppSettings} settings
 * @returns {Promise<void>}
 * @description This function is used to save the settings.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export async function saveSettings(settings: AppSettings): Promise<void> {
  // save the settings
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
