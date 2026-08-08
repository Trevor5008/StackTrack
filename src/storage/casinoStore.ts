import { createId } from '@/src/lib/liveTimer';
import { getDb } from '@/src/storage/db';
import { Casino } from '@/src/types/casino';

type CasinoRow = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

function casinoFromRow(row: CasinoRow): Casino {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadCasinos(): Promise<Casino[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<CasinoRow>(
    `SELECT id, name, created_at, updated_at
     FROM casinos
     ORDER BY name COLLATE NOCASE ASC`,
  );
  return rows.map(casinoFromRow);
}

export async function getCasino(id: string): Promise<Casino | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CasinoRow>(
    `SELECT id, name, created_at, updated_at FROM casinos WHERE id = ?`,
    [id],
  );
  return row ? casinoFromRow(row) : null;
}

export async function findCasinoByName(
  name: string,
): Promise<Casino | null> {
  const db = await getDb();
  const trimmed = name.trim();
  if (!trimmed) return null;
  const row = await db.getFirstAsync<CasinoRow>(
    `SELECT id, name, created_at, updated_at FROM casinos
     WHERE LOWER(TRIM(name)) = LOWER(?)`,
    [trimmed],
  );
  return row ? casinoFromRow(row) : null;
}

export async function addCasino(name: string): Promise<Casino> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Enter a casino name.');
  }

  const existing = await findCasinoByName(trimmed);
  if (existing) {
    throw new Error('A casino with that name already exists.');
  }

  const now = new Date().toISOString();
  const casino: Casino = {
    id: createId(),
    name: trimmed,
    createdAt: now,
    updatedAt: now,
  };

  const db = await getDb();
  await db.runAsync(
    `INSERT INTO casinos (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)`,
    [casino.id, casino.name, casino.createdAt, casino.updatedAt],
  );
  return casino;
}

/** Find by name or create. */
export async function ensureCasino(name: string): Promise<Casino> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Enter a casino name.');
  }
  const existing = await findCasinoByName(trimmed);
  if (existing) return existing;
  return addCasino(trimmed);
}

export async function renameCasino(
  id: string,
  name: string,
): Promise<Casino> {
  const trimmed = name.trim();
  if (!trimmed) {
    throw new Error('Enter a casino name.');
  }
  const conflict = await findCasinoByName(trimmed);
  if (conflict && conflict.id !== id) {
    throw new Error('A casino with that name already exists.');
  }

  const now = new Date().toISOString();
  const db = await getDb();
  await db.runAsync(
    `UPDATE casinos SET name = ?, updated_at = ? WHERE id = ?`,
    [trimmed, now, id],
  );
  // Keep denormalized session / active location in sync.
  await db.runAsync(`UPDATE sessions SET location = ? WHERE casino_id = ?`, [
    trimmed,
    id,
  ]);
  await db.runAsync(
    `UPDATE active_sessions SET location = ? WHERE casino_id = ?`,
    [trimmed, id],
  );

  const updated = await getCasino(id);
  if (!updated) {
    throw new Error('Casino not found.');
  }
  return updated;
}

/** Delete casino and cascade its sessions / live session at that venue. */
export async function deleteCasino(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    const sessionRows = await db.getAllAsync<{ id: string }>(
      `SELECT id FROM sessions WHERE casino_id = ?`,
      [id],
    );
    for (const row of sessionRows) {
      await db.runAsync(`DELETE FROM session_tables WHERE session_id = ?`, [
        row.id,
      ]);
    }
    await db.runAsync(`DELETE FROM sessions WHERE casino_id = ?`, [id]);

    const active = await db.getFirstAsync<{ id: string }>(
      `SELECT id FROM active_sessions WHERE casino_id = ?`,
      [id],
    );
    if (active) {
      await db.runAsync(
        `DELETE FROM active_tables WHERE active_session_id = ?`,
        [active.id],
      );
      await db.runAsync(`DELETE FROM active_sessions WHERE id = ?`, [
        active.id,
      ]);
    }

    await db.runAsync(`DELETE FROM casinos WHERE id = ?`, [id]);
  });
}

export async function clearCasinos(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM casinos');
}
