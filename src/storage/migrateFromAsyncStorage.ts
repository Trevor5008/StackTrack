import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureCasino } from '@/src/storage/casinoStore';
import { setMeta } from '@/src/storage/db';
import { sessionInsertParams } from '@/src/storage/mappers';
import {
  isSession,
  normalizeSession,
  parseSettingsPayload,
} from '@/src/storage/validators';
import { AppSettings, Session } from '@/src/types/session';

const SESSIONS_KEY = '@stacktrack/sessions';
const SETTINGS_KEY = '@stacktrack/settings';
export const ASYNC_MIGRATED_META_KEY = 'async_migrated';

export type AsyncMigrationResult = {
  migrated: boolean;
  sessions: Session[];
  settings: AppSettings | null;
  warning: string | null;
};

/** Accept legacy rows that predate casinoId by filling a placeholder. */
function coerceLegacySession(item: unknown): Session | null {
  if (!item || typeof item !== 'object') return null;
  const raw = item as Partial<Session>;
  const candidate = {
    ...raw,
    casinoId:
      typeof raw.casinoId === 'string' && raw.casinoId.trim()
        ? raw.casinoId
        : '__legacy__',
  };
  if (!isSession(candidate)) return null;
  return normalizeSession(candidate);
}

function extractSessionList(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed;
  if (
    parsed &&
    typeof parsed === 'object' &&
    'sessions' in parsed &&
    Array.isArray((parsed as { sessions: unknown }).sessions)
  ) {
    return (parsed as { sessions: unknown[] }).sessions;
  }
  return null;
}

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

  const [rawSessions, rawSettings] = await Promise.all([
    AsyncStorage.getItem(SESSIONS_KEY),
    AsyncStorage.getItem(SETTINGS_KEY),
  ]);

  const warnings: string[] = [];
  let sessions: Session[] = [];
  let settings: AppSettings | null = null;

  if (rawSessions) {
    try {
      const parsed = JSON.parse(rawSessions) as unknown;
      const list = extractSessionList(parsed);
      if (!list) {
        warnings.push('Saved sessions were invalid and could not be loaded.');
      } else {
        let dropped = 0;
        for (const item of list) {
          const session = coerceLegacySession(item);
          if (!session) {
            dropped += 1;
            continue;
          }
          sessions.push(session);
        }
        if (dropped > 0) {
          warnings.push(
            `Skipped ${dropped} invalid session${dropped === 1 ? '' : 's'} from storage.`,
          );
        }
      }
    } catch {
      warnings.push('Saved sessions were corrupt and could not be loaded.');
    }
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
        const withCasinos: Session[] = [];
        for (const session of sessions) {
          const casino = await ensureCasino(
            session.location.trim() || 'Unknown casino',
          );
          const normalized = normalizeSession({
            ...session,
            casinoId: casino.id,
            location: casino.name,
          });
          withCasinos.push(normalized);
          await db.runAsync(
            `INSERT OR REPLACE INTO sessions (
              id, date, location, casino_id, starting_bankroll, buy_in, cash_out,
              hours_played, net_result, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            sessionInsertParams(normalized),
          );
        }
        sessions = withCasinos;
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
