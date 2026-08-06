import type { SQLiteDatabase } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

export const DATABASE_NAME = 'stacktrack.db';
export const SCHEMA_VERSION = 2;

const SCHEMA_V1_SQL = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  starting_bankroll REAL NOT NULL,
  currency TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  starting_bankroll REAL NOT NULL,
  buy_in REAL NOT NULL,
  cash_out REAL NOT NULL,
  hours_played REAL NOT NULL,
  net_result REAL NOT NULL,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date DESC, created_at DESC);
`;

const SCHEMA_V2_SQL = `
CREATE TABLE IF NOT EXISTS active_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  location TEXT NOT NULL,
  starting_bankroll REAL NOT NULL,
  buy_in REAL,
  segment_started_at TEXT NOT NULL,
  accumulated_ms INTEGER NOT NULL,
  is_paused INTEGER NOT NULL,
  paused_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS active_tables (
  id TEXT PRIMARY KEY NOT NULL,
  active_session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  net_result REAL NOT NULL,
  rank_placeholder INTEGER,
  rules_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (active_session_id) REFERENCES active_sessions(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS session_tables (
  id TEXT PRIMARY KEY NOT NULL,
  session_id TEXT NOT NULL,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  net_result REAL NOT NULL,
  rank_placeholder INTEGER,
  rules_json TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_active_tables_session
  ON active_tables(active_session_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_session_tables_session
  ON session_tables(session_id, sort_order);
`;

let dbPromise: Promise<SQLiteDatabase> | null = null;
let schemaReady = false;

export async function getDb(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  const db = await dbPromise;
  if (!schemaReady) {
    try {
      await db.execAsync('PRAGMA journal_mode = WAL;');
    } catch {
      // WAL is unsupported on some web/sqlite builds.
    }
    try {
      await db.execAsync('PRAGMA foreign_keys = ON;');
    } catch {
      // ignore
    }
    await db.execAsync(SCHEMA_V1_SQL);
    await db.execAsync(SCHEMA_V2_SQL);
    const version = await getMeta(db, 'schema_version');
    if (version !== String(SCHEMA_VERSION)) {
      await setMeta(db, 'schema_version', String(SCHEMA_VERSION));
    }
    schemaReady = true;
  }
  return db;
}

export async function getMeta(
  db: SQLiteDatabase,
  key: string,
): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM meta WHERE key = ?',
    [key],
  );
  return row?.value ?? null;
}

export async function setMeta(
  db: SQLiteDatabase,
  key: string,
  value: string,
): Promise<void> {
  await db.runAsync(
    `INSERT INTO meta (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value],
  );
}

export function resetDbSingletonForTests(): void {
  dbPromise = null;
  schemaReady = false;
}
