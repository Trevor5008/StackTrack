export type Session = {
  // id to handle the id
  id: string;
  // date to handle the date
  date: string;
  // location to handle the location
  location: string;
  // starting bankroll to handle the starting bankroll
  startingBankroll: number;
  // buy in to handle the buy in
  buyIn: number;
  // cash out to handle the cash out
  cashOut: number;
  // hours played to handle the hours played
  hoursPlayed: number;
  netResult: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Session input
 * @returns {SessionInput}
 * @description This type is used to create a session input.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export type SessionInput = Omit<
  Session,
  'id' | 'netResult' | 'createdAt' | 'updatedAt'
>;

/**
 * App settings
 * @returns {AppSettings}
 * @description This type is used to create a app settings.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export type AppSettings = {
  // starting bankroll to handle the starting bankroll
  startingBankroll: number;
  // currency to handle the currency
  currency: string;
};

/**
 * Win loss record
 * @returns {WinLossRecord}
 * @description This type is used to create a win loss record.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export type WinLossRecord = {
  // wins to handle the wins
  wins: number;
  // losses to handle the losses
  losses: number;
  pushes: number;
};
