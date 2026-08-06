export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Elapsed ms for an active timer segment. */
export function computeElapsedMs(input: {
  accumulatedMs: number;
  isPaused: boolean;
  segmentStartedAt: string;
  nowMs?: number;
}): number {
  const now = input.nowMs ?? Date.now();
  if (input.isPaused) return Math.max(0, input.accumulatedMs);
  const segmentStart = new Date(input.segmentStartedAt).getTime();
  const running = Number.isFinite(segmentStart)
    ? Math.max(0, now - segmentStart)
    : 0;
  return Math.max(0, input.accumulatedMs + running);
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
