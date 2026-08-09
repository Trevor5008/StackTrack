export type ActiveSession = {
  id: string;
  casinoId: string;
  /** Denormalized casino name for the live banner. */
  location: string;
  /** Total bankroll snapshot when the session started. */
  startingBankroll: number;
  /** Session budget (buy-in) chosen at start. */
  buyIn: number;
  /** Chips still available to stake (persisted for reload). */
  remainingBudget: number;
  /** Max acceptable estimated RoR % (preset). */
  riskTolerance: number;
  /** Legacy session timer fields (hours derive from table timers). */
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
  /** Cumulative P/L across play segments (ending chips − stake). */
  netResult: number;
  /** Chips currently on this table while Playing; 0 when paused. */
  stake: number;
  /** Betting unit for RoR; null until set on Play. */
  bettingUnit: number | null;
  rankPlaceholder: number | null;
  rulesJson: string | null;
  accumulatedMs: number;
  /** ISO start of the current running segment; null while paused. */
  segmentStartedAt: string | null;
  isPaused: boolean;
  pausedAt: string | null;
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
  /** Snapshot of table timer elapsed when the session ended. */
  elapsedMs: number;
  /** Betting unit at end (null if never set). */
  bettingUnit: number | null;
  createdAt: string;
};

export type StartLiveSessionInput = {
  casinoId: string;
  startingBankroll: number;
  /** Session budget; must be > 0 and ≤ startingBankroll. */
  budget: number;
  /** Risk tolerance preset (%). */
  riskTolerance: number;
};

export type AddTableInput = {
  name: string;
  netResult?: number;
};
