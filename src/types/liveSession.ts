export type ActiveSession = {
  id: string;
  casinoId: string;
  /** Denormalized casino name for the live banner. */
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

export type ActiveTable = {
  id: string;
  activeSessionId: string;
  name: string;
  sortOrder: number;
  netResult: number;
  rankPlaceholder: number | null;
  rulesJson: string | null;
  createdAt: string;
  updatedAt: string;
};

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

export type StartLiveSessionInput = {
  casinoId: string;
  startingBankroll: number;
};

export type EndLiveSessionInput = {
  buyIn: number;
  cashOut: number;
};

export type AddTableInput = {
  name: string;
  netResult?: number;
};
