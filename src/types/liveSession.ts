// Active session type
export type ActiveSession = {
  id: string;
  location: string;
  startingBankroll: number;
  buyIn: number | null;
  /** ISO timestamp when the current running segment started (ignored while paused). */
  segmentStartedAt: string;
  accumulatedMs: number;
  isPaused: boolean;
  pausedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// Active table type
export type ActiveTable = {
  id: string;
  activeSessionId: string;
  name: string;
  sortOrder: number;
  netResult: number;
  /** Legacy field; display ranking is derived from rulesJson. */
  rankPlaceholder: number | null;
  /** JSON-serialized TableRules (see src/types/tableRules.ts). */
  rulesJson: string | null;
  createdAt: string;
  updatedAt: string;
};

// Session table type
export type SessionTable = {
  id: string;
  sessionId: string;
  name: string;
  sortOrder: number;
  netResult: number;
  rankPlaceholder: number | null;
  rulesJson: string | null;
  createdAt: string;
};

// Start live session input type
export type StartLiveSessionInput = {
  location?: string;
  startingBankroll: number;
};

// End live session input type
export type EndLiveSessionInput = {
  location: string;
  buyIn: number;
  cashOut: number;
};

// Add table input type
export type AddTableInput = {
  name: string;
  netResult?: number;
};
