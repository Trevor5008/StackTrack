import AsyncStorage from '@react-native-async-storage/async-storage';

import { sampleSessions } from '@/src/data/sampleSessions';
import { AppSettings, Session } from '@/src/types/session';

const SESSIONS_KEY = '@stacktrack/sessions';
const SETTINGS_KEY = '@stacktrack/settings';

export const defaultSettings: AppSettings = {
  startingBankroll: 5000,
  currency: 'USD',
};

export async function loadSessions(): Promise<Session[]> {
  const value = await AsyncStorage.getItem(SESSIONS_KEY);
  if (value) return JSON.parse(value) as Session[];

  await saveSessions(sampleSessions);
  return sampleSessions;
}

export async function saveSessions(sessions: Session[]): Promise<void> {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export async function loadSettings(): Promise<AppSettings> {
  const value = await AsyncStorage.getItem(SETTINGS_KEY);
  return value ? (JSON.parse(value) as AppSettings) : defaultSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
