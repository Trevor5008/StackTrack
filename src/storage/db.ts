import type { SQLiteDatabase } from 'expo-sqlite';
import * as SQLite from 'expo-sqlite';

import { casinoNameKey } from '@/src/lib/casinoName';
import { computeElapsedMs, createId } from '@/src/lib/liveTimer';

export const DATABASE_NAME = 'stacktrack.db';
export const SCHEMA_VERSION = 4;

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

const SCHEMA_V3_SQL = `
CREATE TABLE IF NOT EXISTS casinos (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_casinos_name ON casinos(name COLLATE NOCASE);
`;

let dbPromise: Promise<SQLiteDatabase> | null = null;
let schemaReady = false;

async function columnExists(
  db: SQLiteDatabase,
  table: string,
  column: string,
): Promise<boolean> {
  const rows = await db.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table})`,
  );
  return rows.some((row) => row.name === column);
}

async function migrateToV3(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(SCHEMA_V3_SQL);

  if (!(await columnExists(db, 'sessions', 'casino_id'))) {
    await db.execAsync('ALTER TABLE sessions ADD COLUMN casino_id TEXT');
  }
  if (!(await columnExists(db, 'active_sessions', 'casino_id'))) {
    await db.execAsync(
      'ALTER TABLE active_sessions ADD COLUMN casino_id TEXT',
    );
  }

  const sessionLocations = await db.getAllAsync<{ location: string }>(
    `SELECT DISTINCT location FROM sessions
     WHERE location IS NOT NULL AND TRIM(location) != ''`,
  );
  const activeLocations = await db.getAllAsync<{ location: string }>(
    `SELECT DISTINCT location FROM active_sessions
     WHERE location IS NOT NULL AND TRIM(location) != ''`,
  );

  const names = new Map<string, string>(); // lower -> display
  for (const row of [...sessionLocations, ...activeLocations]) {
    const trimmed = row.location.trim();
    if (!trimmed) continue;
    const key = casinoNameKey(trimmed);
    if (!names.has(key)) names.set(key, trimmed);
  }

  const existing = await db.getAllAsync<{ id: string; name: string }>(
    'SELECT id, name FROM casinos',
  );
  const byLower = new Map(
    existing.map((row) => [casinoNameKey(row.name), row.id]),
  );

  const now = new Date().toISOString();
  for (const [key, display] of names) {
    if (byLower.has(key)) continue;
    const id = createId();
    await db.runAsync(
      `INSERT INTO casinos (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [id, display, now, now],
    );
    byLower.set(key, id);
  }

  let unknownId = byLower.get('unknown casino');
  if (!unknownId) {
    unknownId = createId();
    await db.runAsync(
      `INSERT INTO casinos (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
      [unknownId, 'Unknown casino', now, now],
    );
    byLower.set('unknown casino', unknownId);
  }

  const sessionsNeedingId = await db.getAllAsync<{
    id: string;
    location: string;
    casino_id: string | null;
  }>(`SELECT id, location, casino_id FROM sessions`);

  for (const row of sessionsNeedingId) {
    if (row.casino_id) continue;
    const key = casinoNameKey(row.location ?? '');
    const casinoId = byLower.get(key) ?? unknownId;
    await db.runAsync(`UPDATE sessions SET casino_id = ? WHERE id = ?`, [
      casinoId,
      row.id,
    ]);
  }

  const activeNeedingId = await db.getAllAsync<{
    id: string;
    location: string;
    casino_id: string | null;
  }>(`SELECT id, location, casino_id FROM active_sessions`);

  for (const row of activeNeedingId) {
    if (row.casino_id) continue;
    const key = casinoNameKey(row.location ?? '');
    const casinoId = byLower.get(key) ?? unknownId;
    await db.runAsync(
      `UPDATE active_sessions SET casino_id = ? WHERE id = ?`,
      [casinoId, row.id],
    );
  }
}

async function migrateToV4(db: SQLiteDatabase): Promise<void> {
  if (!(await columnExists(db, 'active_tables', 'accumulated_ms'))) {
    await db.execAsync(
      'ALTER TABLE active_tables ADD COLUMN accumulated_ms INTEGER NOT NULL DEFAULT 0',
    );
  }
  if (!(await columnExists(db, 'active_tables', 'segment_started_at'))) {
    await db.execAsync(
      'ALTER TABLE active_tables ADD COLUMN segment_started_at TEXT',
    );
  }
  if (!(await columnExists(db, 'active_tables', 'is_paused'))) {
    await db.execAsync(
      'ALTER TABLE active_tables ADD COLUMN is_paused INTEGER NOT NULL DEFAULT 1',
    );
  }
  if (!(await columnExists(db, 'active_tables', 'paused_at'))) {
    await db.execAsync('ALTER TABLE active_tables ADD COLUMN paused_at TEXT');
  }
  if (!(await columnExists(db, 'session_tables', 'elapsed_ms'))) {
    await db.execAsync(
      'ALTER TABLE session_tables ADD COLUMN elapsed_ms INTEGER NOT NULL DEFAULT 0',
    );
  }

  // Move in-progress session wall-clock onto the first table (paused).
  const active = await db.getFirstAsync<{
    id: string;
    accumulated_ms: number;
    is_paused: number;
    segment_started_at: string;
  }>(
    `SELECT id, accumulated_ms, is_paused, segment_started_at
     FROM active_sessions LIMIT 1`,
  );
  if (!active) return;

  const elapsed = computeElapsedMs({
    accumulatedMs: active.accumulated_ms ?? 0,
    isPaused: active.is_paused === 1,
    segmentStartedAt: active.segment_started_at,
  });
  if (elapsed <= 0) return;

  const firstTable = await db.getFirstAsync<{
    id: string;
    accumulated_ms: number;
  }>(
    `SELECT id, accumulated_ms FROM active_tables
     WHERE active_session_id = ?
     ORDER BY sort_order ASC, created_at ASC
     LIMIT 1`,
    [active.id],
  );
  if (!firstTable) return;
  if ((firstTable.accumulated_ms ?? 0) > 0) return;

  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE active_tables
     SET accumulated_ms = ?,
         is_paused = 1,
         segment_started_at = NULL,
         paused_at = ?,
         updated_at = ?
     WHERE id = ?`,
    [elapsed, now, now, firstTable.id],
  );
  await db.runAsync(
    `UPDATE active_sessions
     SET accumulated_ms = 0,
         is_paused = 1,
         paused_at = ?,
         updated_at = ?
     WHERE id = ?`,
    [now, now, active.id],
  );
}

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
    await migrateToV3(db);
    await migrateToV4(db);
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
