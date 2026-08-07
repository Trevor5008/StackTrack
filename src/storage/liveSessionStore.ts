import { getDb } from '@/src/storage/db';
import { createId } from '@/src/lib/liveTimer';
import { getCasino } from '@/src/storage/casinoStore';
import {
  ActiveSession,
  ActiveTable,
  AddTableInput,
  SessionTable,
  StartLiveSessionInput,
} from '@/src/types/liveSession';

// Active session row type
type ActiveSessionRow = {
  id: string;
  casino_id: string | null;
  location: string;
  starting_bankroll: number;
  buy_in: number | null;
  segment_started_at: string;
  accumulated_ms: number;
  is_paused: number;
  paused_at: string | null;
  created_at: string;
  updated_at: string;
};

// Active table row type
type ActiveTableRow = {
  id: string;
  active_session_id: string;
  name: string;
  sort_order: number;
  net_result: number;
  rank_placeholder: number | null;
  rules_json: string | null;
  created_at: string;
  updated_at: string;
};

// Session table row type
type SessionTableRow = {
  id: string;
  session_id: string;
  name: string;
  sort_order: number;
  net_result: number;
  rank_placeholder: number | null;
  rules_json: string | null;
  created_at: string;
};

// Convert active session row to active session
function activeSessionFromRow(row: ActiveSessionRow): ActiveSession {
  return {
    id: row.id,
    casinoId: row.casino_id ?? '',
    location: row.location,
    startingBankroll: row.starting_bankroll,
    buyIn: row.buy_in,
    segmentStartedAt: row.segment_started_at,
    accumulatedMs: row.accumulated_ms,
    isPaused: row.is_paused === 1,
    pausedAt: row.paused_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert active table row to active table
function activeTableFromRow(row: ActiveTableRow): ActiveTable {
  return {
    id: row.id,
    activeSessionId: row.active_session_id,
    name: row.name,
    sortOrder: row.sort_order,
    netResult: row.net_result,
    rankPlaceholder: row.rank_placeholder,
    rulesJson: row.rules_json,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Convert session table row to session table
function sessionTableFromRow(row: SessionTableRow): SessionTable {
  return {
    id: row.id,
    sessionId: row.session_id,
    name: row.name,
    sortOrder: row.sort_order,
    netResult: row.net_result,
    rankPlaceholder: row.rank_placeholder,
    rulesJson: row.rules_json,
    createdAt: row.created_at,
  };
}

// Load the active session
export async function loadActiveSession(): Promise<ActiveSession | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<ActiveSessionRow>(
    `SELECT id, casino_id, location, starting_bankroll, buy_in, segment_started_at,
            accumulated_ms, is_paused, paused_at, created_at, updated_at
     FROM active_sessions
     LIMIT 1`,
  );
  return row ? activeSessionFromRow(row) : null;
}

// Load the active tables
export async function loadActiveTables(
  activeSessionId: string,
): Promise<ActiveTable[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ActiveTableRow>(
    `SELECT id, active_session_id, name, sort_order, net_result,
            rank_placeholder, rules_json, created_at, updated_at
     FROM active_tables
     WHERE active_session_id = ?
     ORDER BY sort_order ASC, created_at ASC`,
    [activeSessionId],
  );
  return rows.map(activeTableFromRow);
}

// Start a new active session
export async function startActiveSession(
  input: StartLiveSessionInput,
): Promise<ActiveSession> {
  const db = await getDb();
  const existing = await loadActiveSession();
  if (existing) {
    throw new Error('A live session is already in progress.');
  }

  const casino = await getCasino(input.casinoId);
  if (!casino) {
    throw new Error('Select a casino before starting a session.');
  }

  const now = new Date().toISOString();
  const session: ActiveSession = {
    id: createId(),
    casinoId: casino.id,
    location: casino.name,
    startingBankroll: input.startingBankroll,
    buyIn: null,
    segmentStartedAt: now,
    accumulatedMs: 0,
    isPaused: false,
    pausedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO active_sessions (
      id, casino_id, location, starting_bankroll, buy_in, segment_started_at,
      accumulated_ms, is_paused, paused_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.casinoId,
      session.location,
      session.startingBankroll,
      session.buyIn,
      session.segmentStartedAt,
      session.accumulatedMs,
      0,
      null,
      session.createdAt,
      session.updatedAt,
    ],
  );

  return session;
}

// Update the active session
export async function updateActiveSession(
  session: ActiveSession,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE active_sessions SET
      casino_id = ?,
      location = ?,
      starting_bankroll = ?,
      buy_in = ?,
      segment_started_at = ?,
      accumulated_ms = ?,
      is_paused = ?,
      paused_at = ?,
      updated_at = ?
     WHERE id = ?`,
    [
      session.casinoId,
      session.location,
      session.startingBankroll,
      session.buyIn,
      session.segmentStartedAt,
      session.accumulatedMs,
      session.isPaused ? 1 : 0,
      session.pausedAt,
      session.updatedAt,
      session.id,
    ],
  );
}

// Add a new active table
export async function addActiveTable(
  activeSessionId: string,
  input: AddTableInput,
): Promise<ActiveTable> {
  const db = await getDb();
  const existing = await loadActiveTables(activeSessionId);
  const now = new Date().toISOString();
  const table: ActiveTable = {
    id: createId(),
    activeSessionId,
    name: input.name.trim() || `Table ${existing.length + 1}`,
    sortOrder: existing.length,
    netResult: input.netResult ?? 0,
    rankPlaceholder: null,
    rulesJson: null,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    `INSERT INTO active_tables (
      id, active_session_id, name, sort_order, net_result,
      rank_placeholder, rules_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      table.id,
      table.activeSessionId,
      table.name,
      table.sortOrder,
      table.netResult,
      table.rankPlaceholder,
      table.rulesJson,
      table.createdAt,
      table.updatedAt,
    ],
  );

  return table;
}

// Update an active table
export async function updateActiveTable(table: ActiveTable): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE active_tables SET
      name = ?,
      sort_order = ?,
      net_result = ?,
      rank_placeholder = ?,
      rules_json = ?,
      updated_at = ?
     WHERE id = ?`,
    [
      table.name,
      table.sortOrder,
      table.netResult,
      table.rankPlaceholder,
      table.rulesJson,
      table.updatedAt,
      table.id,
    ],
  );
}

// Clear the active session
export async function clearActiveSession(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM active_tables');
    await db.runAsync('DELETE FROM active_sessions');
  });
}

// Copy tables to a session
export async function copyTablesToSession(
  sessionId: string,
  tables: ActiveTable[],
): Promise<SessionTable[]> {
  const db = await getDb();
  const now = new Date().toISOString();
  const copied: SessionTable[] = tables.map((table) => ({
    id: createId(),
    sessionId,
    name: table.name,
    sortOrder: table.sortOrder,
    netResult: table.netResult,
    rankPlaceholder: table.rankPlaceholder,
    rulesJson: table.rulesJson,
    createdAt: now,
  }));

  await db.withTransactionAsync(async () => {
    for (const table of copied) {
      await db.runAsync(
        `INSERT INTO session_tables (
          id, session_id, name, sort_order, net_result,
          rank_placeholder, rules_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          table.id,
          table.sessionId,
          table.name,
          table.sortOrder,
          table.netResult,
          table.rankPlaceholder,
          table.rulesJson,
          table.createdAt,
        ],
      );
    }
  });

  return copied;
}

// Load the session tables
export async function loadSessionTables(
  sessionId: string,
): Promise<SessionTable[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<SessionTableRow>(
    `SELECT id, session_id, name, sort_order, net_result,
            rank_placeholder, rules_json, created_at
     FROM session_tables
     WHERE session_id = ?
     ORDER BY sort_order ASC, created_at ASC`,
    [sessionId],
  );
  return rows.map(sessionTableFromRow);
}

// Load all session tables
export async function loadAllSessionTables(): Promise<SessionTableRow[]> {
  const db = await getDb();
  return db.getAllAsync<SessionTableRow>(
    `SELECT id, session_id, name, sort_order, net_result,
            rank_placeholder, rules_json, created_at
     FROM session_tables`,
  );
}

// Restore session tables
export async function restoreSessionTables(
  rows: SessionTableRow[],
): Promise<void> {
  if (rows.length === 0) return;
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const row of rows) {
      await db.runAsync(
        `INSERT INTO session_tables (
          id, session_id, name, sort_order, net_result,
          rank_placeholder, rules_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          row.id,
          row.session_id,
          row.name,
          row.sort_order,
          row.net_result,
          row.rank_placeholder,
          row.rules_json,
          row.created_at,
        ],
      );
    }
  });
}

// Clear live and session tables
export async function clearLiveAndSessionTables(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM active_tables');
    await db.runAsync('DELETE FROM active_sessions');
    await db.runAsync('DELETE FROM session_tables');
  });
}
