export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Elapsed ms for an active timer segment. */
export function computeElapsedMs(input: {
  accumulatedMs: number;
  isPaused: boolean;
  segmentStartedAt: string | null;
  nowMs?: number;
}): number {
  const now = input.nowMs ?? Date.now();
  if (input.isPaused) return Math.max(0, input.accumulatedMs);
  if (!input.segmentStartedAt) return Math.max(0, input.accumulatedMs);
  const segmentStart = new Date(input.segmentStartedAt).getTime();
  const running = Number.isFinite(segmentStart)
    ? Math.max(0, now - segmentStart)
    : 0;
  return Math.max(0, input.accumulatedMs + running);
}

export type TableTimerLike = {
  id: string;
  accumulatedMs: number;
  isPaused: boolean;
  segmentStartedAt: string | null;
};

/** Sum of elapsed ms across tables. */
export function sumTableElapsedMs(
  tables: TableTimerLike[],
  nowMs?: number,
): number {
  return tables.reduce(
    (total, table) =>
      total +
      computeElapsedMs({
        accumulatedMs: table.accumulatedMs,
        isPaused: table.isPaused,
        segmentStartedAt: table.segmentStartedAt,
        nowMs,
      }),
    0,
  );
}

/** The single running table, if any. */
export function findRunningTable<T extends TableTimerLike>(
  tables: T[],
): T | null {
  return tables.find((table) => !table.isPaused) ?? null;
}

/**
 * Throws if another table is already running when trying to play `playId`.
 */
export function assertCanPlayTable(
  tables: TableTimerLike[],
  playId: string,
): void {
  const running = findRunningTable(tables);
  if (running && running.id !== playId) {
    throw new Error('Pause the current table before playing another.');
  }
}

export type DeletableTableLike = {
  isPaused: boolean;
  stake: number;
};

/** Throws if the table is still playing or has stake out. */
export function assertCanDeleteTable(table: DeletableTableLike): void {
  if (!table.isPaused || table.stake > 0) {
    throw new Error('Pause this table before deleting it.');
  }
}

// Convert elapsed ms to hours played
export function msToHoursPlayed(elapsedMs: number): number {
  const hours = elapsedMs / 3_600_000;
  return Math.round(hours * 100) / 100;
}

// Format elapsed time as HH:MM:SS
export function formatElapsed(elapsedMs: number): string {
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
