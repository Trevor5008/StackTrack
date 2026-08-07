import { sampleSessions } from '@/src/data/sampleSessions';
import { ensureCasino } from '@/src/storage/casinoStore';
import { getDb, SCHEMA_VERSION } from '@/src/storage/db';
import {
  clearLiveAndSessionTables,
  loadAllSessionTables,
  restoreSessionTables,
} from '@/src/storage/liveSessionStore';
import {
  sessionFromRow,
  sessionInsertParams,
  SessionRow,
  settingsFromRow,
  SettingsRow,
} from '@/src/storage/mappers';
import { migrateFromAsyncStorageIfNeeded } from '@/src/storage/migrateFromAsyncStorage';
import {
  isSession,
  normalizeSession,
} from '@/src/storage/validators';
import { AppSettings, Session } from '@/src/types/session';

export const STORAGE_VERSION = SCHEMA_VERSION;

export const defaultSettings: AppSettings = {
  startingBankroll: 5000,
  currency: 'USD',
};

export type LoadSessionsResult = {
  sessions: Session[];
  warning: string | null;
};

export type LoadSettingsResult = {
  settings: AppSettings;
  warning: string | null;
};

export type StoredSessions = {
  version: typeof STORAGE_VERSION;
  sessions: Session[];
};

export type StoredSettings = {
  version: typeof STORAGE_VERSION;
  settings: AppSettings;
};

let migrationPromise: Promise<string | null> | null = null;

async function ensureReady(): Promise<string | null> {
  const db = await getDb();
  if (!migrationPromise) {
    migrationPromise = migrateFromAsyncStorageIfNeeded(db, defaultSettings).then(
      (result) => result.warning,
    );
  }
  return migrationPromise;
}

const INSERT_SESSION_SQL = `INSERT INTO sessions (
  id, date, location, casino_id, starting_bankroll, buy_in, cash_out,
  hours_played, net_result, notes, created_at, updated_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

export async function saveSessions(sessions: Session[]): Promise<void> {
  await ensureReady();
  const db = await getDb();

  const normalized = sessions.map((session) => {
    if (!isSession(session)) {
      throw new Error('Cannot save invalid session data.');
    }
    return normalizeSession(session);
  });

  const existingTables = await loadAllSessionTables();
  const keepIds = new Set(normalized.map((session) => session.id));
  const tablesToRestore = existingTables.filter((row) =>
    keepIds.has(row.session_id),
  );

  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM session_tables');
    await db.runAsync('DELETE FROM sessions');
    for (const session of normalized) {
      await db.runAsync(INSERT_SESSION_SQL, sessionInsertParams(session));
    }
  });
  await restoreSessionTables(tablesToRestore);
}

export async function loadSessions(): Promise<LoadSessionsResult> {
  const migrationWarning = await ensureReady();
  const db = await getDb();

  const rows = await db.getAllAsync<SessionRow>(
    `SELECT id, date, location, casino_id, starting_bankroll, buy_in, cash_out,
            hours_played, net_result, notes, created_at, updated_at
     FROM sessions
     ORDER BY date DESC, created_at DESC`,
  );

  const sessions: Session[] = [];
  let dropped = 0;

  for (const row of rows) {
    const candidate = sessionFromRow(row);
    if (!isSession(candidate)) {
      dropped += 1;
      continue;
    }
    sessions.push(normalizeSession(candidate));
  }

  const loadWarning =
    dropped > 0
      ? `Skipped ${dropped} invalid session${dropped === 1 ? '' : 's'} from storage.`
      : null;

  const warnings = [migrationWarning, loadWarning].filter(Boolean);
  return {
    sessions,
    warning: warnings.length ? warnings.join(' ') : null,
  };
}

export async function clearSessions(): Promise<void> {
  await ensureReady();
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM session_tables');
    await db.runAsync('DELETE FROM sessions');
  });
}

export async function seedDemoSessions(): Promise<Session[]> {
  const demos: Session[] = [];
  for (const sample of sampleSessions) {
    const casino = await ensureCasino(sample.location);
    const session = normalizeSession({
      ...sample,
      casinoId: casino.id,
      location: casino.name,
    });
    if (!isSession(session)) {
      throw new Error('Demo session data failed validation.');
    }
    demos.push(session);
  }
  await saveSessions(demos);
  return demos;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await ensureReady();

  if (
    !Number.isFinite(settings.startingBankroll) ||
    settings.startingBankroll < 0 ||
    !settings.currency.trim()
  ) {
    throw new Error('Cannot save invalid settings.');
  }

  const next: AppSettings = {
    startingBankroll: settings.startingBankroll,
    currency: settings.currency.trim().toUpperCase(),
  };

  const db = await getDb();
  await db.runAsync(
    `INSERT INTO settings (id, starting_bankroll, currency)
     VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       starting_bankroll = excluded.starting_bankroll,
       currency = excluded.currency`,
    [next.startingBankroll, next.currency],
  );
}

export async function loadSettings(): Promise<LoadSettingsResult> {
  const migrationWarning = await ensureReady();
  const db = await getDb();

  const row = await db.getFirstAsync<SettingsRow>(
    'SELECT id, starting_bankroll, currency FROM settings WHERE id = 1',
  );

  if (!row) {
    await saveSettings(defaultSettings);
    return { settings: defaultSettings, warning: migrationWarning };
  }

  return {
    settings: settingsFromRow(row),
    warning: migrationWarning,
  };
}

export async function clearAllData(): Promise<void> {
  await ensureReady();
  const db = await getDb();
  await clearLiveAndSessionTables();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM sessions');
    await db.runAsync('DELETE FROM casinos');
    await db.runAsync('DELETE FROM settings');
  });
  await saveSettings(defaultSettings);
}
