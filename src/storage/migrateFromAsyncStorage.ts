import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SQLiteDatabase } from 'expo-sqlite';

import { setMeta } from '@/src/storage/db';
import { sessionInsertParams } from '@/src/storage/mappers';
import {
  isSession,
  normalizeSession,
  parseSessionsPayload,
  parseSettingsPayload,
} from '@/src/storage/validators';
import { AppSettings, Session } from '@/src/types/session';

// Keys for the storage
const SESSIONS_KEY = '@stacktrack/sessions';
const SETTINGS_KEY = '@stacktrack/settings';
// Key for the meta data
export const ASYNC_MIGRATED_META_KEY = 'async_migrated';
// Type for the async migration result

// Type for the async migration result
export type AsyncMigrationResult = {
  migrated: boolean;
  sessions: Session[];
  settings: AppSettings | null;
  warning: string | null;
};

/**
 * One-time import of legacy AsyncStorage envelopes into SQLite
 * Safe to call repeatedly; no-ops once meta.async_migrated = 1.
 */
export async function migrateFromAsyncStorageIfNeeded(
  db: SQLiteDatabase,
  fallbackSettings: AppSettings,
): Promise<AsyncMigrationResult> {
  const already = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    [ASYNC_MIGRATED_META_KEY],
  );
  if (already?.value === '1') {
    return {
      migrated: false,
      sessions: [],
      settings: null,
      warning: null,
    };
  }

  // Get the raw sessions and settings from the storage
  const [rawSessions, rawSettings] = await Promise.all([
    AsyncStorage.getItem(SESSIONS_KEY),
    AsyncStorage.getItem(SETTINGS_KEY),
  ]);

  // Warnings for the migration
  const warnings: string[] = [];
  // Sessions for the migration
  let sessions: Session[] = [];
  // Settings for the migration
  let settings: AppSettings | null = null;

  if (rawSessions) {
    // Parse the sessions payload
    const parsed = parseSessionsPayload(rawSessions);
    sessions = parsed.sessions;
    if (parsed.warning) warnings.push(parsed.warning);
  }

  if (rawSettings) {
    const parsed = parseSettingsPayload(rawSettings, fallbackSettings);
    settings = parsed.settings;
    if (parsed.warning) warnings.push(parsed.warning);
  }

  await db.withTransactionAsync(async () => {
    if (sessions.length > 0) {
      const existingCount = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM sessions',
      );
      if ((existingCount?.count ?? 0) === 0) {
        for (const session of sessions) {
          if (!isSession(session)) continue;
          const normalized = normalizeSession(session);
          await db.runAsync(
            `INSERT OR REPLACE INTO sessions (
              id, date, location, starting_bankroll, buy_in, cash_out,
              hours_played, net_result, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            sessionInsertParams(normalized),
          );
        }
      }
    }

    if (settings) {
      const existingSettings = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM settings WHERE id = 1',
      );
      if (!existingSettings) {
        await db.runAsync(
          `INSERT INTO settings (id, starting_bankroll, currency)
           VALUES (1, ?, ?)`,
          [settings.startingBankroll, settings.currency],
        );
      }
    }

    await setMeta(db, ASYNC_MIGRATED_META_KEY, '1');
  });

  await AsyncStorage.multiRemove([SESSIONS_KEY, SETTINGS_KEY]);

  return {
    migrated: true,
    sessions,
    settings,
    warning: warnings.length ? warnings.join(' ') : null,
  };
}
