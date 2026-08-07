export type Session = {
  id: string;
  date: string;
  /** Denormalized casino name for display; casinoId is source of truth. */
  location: string;
  casinoId: string;
  startingBankroll: number;
  buyIn: number;
  cashOut: number;
  hoursPlayed: number;
  netResult: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SessionInput = Omit<
  Session,
  'id' | 'netResult' | 'createdAt' | 'updatedAt'
>;

export type AppSettings = {
  startingBankroll: number;
  currency: string;
};

export type WinLossRecord = {
  wins: number;
  losses: number;
  pushes: number;
};
