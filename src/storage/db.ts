import type { SQLiteDatabase } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

// Name of the database
export const DATABASE_NAME = 'stacktrack.db';
// Version of the schema
export const SCHEMA_VERSION = 1;
// Schema for the database

// SQL schema for the database
const SCHEMA_SQL = `
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

// Promise for the database
let dbPromise: Promise<SQLiteDatabase> | null = null;
// Flag to check if the schema is ready
let schemaReady = false;

// Function to get the database
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
    await db.execAsync(SCHEMA_SQL);
    const version = await getMeta(db, 'schema_version');
    if (version !== String(SCHEMA_VERSION)) {
      await setMeta(db, 'schema_version', String(SCHEMA_VERSION));
    }
    schemaReady = true;
  }
  return db;
}

// Function to get the meta data
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

// Function to set the meta data
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

// Function to reset the database singleton for tests
export function resetDbSingletonForTests(): void {
  dbPromise = null;
  schemaReady = false;
}
