import { Session, WinLossRecord } from '@/src/types/session';

export function sessionsForCasino(
  sessions: Session[],
  casinoId: string,
): Session[] {
  return sessions.filter((session) => session.casinoId === casinoId);
}

/**
 * Lifetime profit loss
 * @param {Session[]} sessions
 * @returns {number}
 * @description This function is used to get the lifetime profit loss.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function lifetimeProfitLoss(sessions: Session[]): number {
  return sessions.reduce((total, session) => total + session.netResult, 0);
}

/**
 * Current bankroll
 * @param {number} startingBankroll
 * @param {Session[]} sessions
 * @returns {number}
 * @description This function is used to get the current bankroll.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function currentBankroll(
  startingBankroll: number,
  sessions: Session[],
): number {
  return startingBankroll + lifetimeProfitLoss(sessions);
}

/**
 * Total sessions
 * @param {Session[]} sessions
 * @returns {number}
 * @description This function is used to get the total sessions.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function totalSessions(sessions: Session[]): number {
  return sessions.length;
}

/**
 * Total hours
 * @param {Session[]} sessions
 * @returns {number}
 * @description This function is used to get the total hours.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function totalHours(sessions: Session[]): number {
  return sessions.reduce(
    (total, session) => total + session.hoursPlayed,
    0,
  );
}

/**
 * Hourly rate
 * @param {Session[]} sessions
 * @returns {number}
 * @description This function is used to get the hourly rate.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function hourlyRate(sessions: Session[]): number {
  const hours = totalHours(sessions);
  return hours === 0 ? 0 : lifetimeProfitLoss(sessions) / hours;
}

/**
 * Win loss record
 * @param {Session[]} sessions
 * @returns {WinLossRecord}
 * @description This function is used to get the win loss record.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function winLossRecord(sessions: Session[]): WinLossRecord {
  return sessions.reduce<WinLossRecord>(
    (record, session) => {
      // if the net result is greater than 0, increment the wins
      if (session.netResult > 0) record.wins += 1;
      // if the net result is less than 0, increment the losses
      else if (session.netResult < 0) record.losses += 1;
      // if the net result is equal to 0, increment the pushes
      else record.pushes += 1;
      return record;
    },
    { wins: 0, losses: 0, pushes: 0 },
  );
}

/**
 * Biggest win
 * @param {Session[]} sessions
 * @returns {number}
 * @description This function is used to get the biggest win.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function biggestWin(sessions: Session[]): number {
  return sessions.reduce(
    (biggest, session) => Math.max(biggest, session.netResult),
    0,
  );
}

/**
 * Biggest loss
 * @param {Session[]} sessions
 * @returns {number}
 * @description This function is used to get the biggest loss.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export function biggestLoss(sessions: Session[]): number {
  // return the biggest loss
  return sessions.reduce(
    // biggest to handle the biggest state
    (biggest, session) => Math.min(biggest, session.netResult),
    // initial value to handle the initial value
    0,
  );
}
