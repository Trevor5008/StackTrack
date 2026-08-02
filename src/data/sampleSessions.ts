import { Session } from '@/src/types/session';

/**
 * Now
 * @returns {string}
 * @description This function is used to get the current date and time.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
const now = new Date().toISOString();

/**
 * Sample sessions
 * @returns {Session[]}
 * @description This function is used to get the sample sessions.
 * @example
 * <SessionProvider>
 *   <SessionContext.Provider value={value}>
 *     {children}
 *   </SessionContext.Provider>
 * </SessionProvider>
 */
export const sampleSessions: Session[] = [
  {
    // id to handle the id
    id: 'sample-3',
    // date to handle the date
    date: '2026-07-24',
    // location to handle the location
    location: 'Riverside Casino',
    // starting bankroll to handle the starting bankroll
    startingBankroll: 5525,
    // buy in to handle the buy in
    buyIn: 500,
    // cash out to handle the cash out
    cashOut: 775,
    // hours played to handle the hours played
    hoursPlayed: 3.5,
    // net result to handle the net result
    netResult: 275,
    // notes to handle the notes
    notes: 'Good shoe selection and a disciplined stop.',
    // created at to handle the created at
    createdAt: now, 
    // updated at to handle the updated at
    updatedAt: now,
  },
  {
    // id to handle the id
    id: 'sample-2',
    // date to handle the date
    date: '2026-07-18',
    // location to handle the location
    location: 'Grand Harbor',
    // starting bankroll to handle the starting bankroll
    startingBankroll: 5700,
    // buy in to handle the buy in
    buyIn: 600,
    // cash out to handle the cash out
    cashOut: 425,
    // hours played to handle the hours played
    hoursPlayed: 2.25,
    // net result to handle the net result
    netResult: -175,
    // notes to handle the notes
    notes: 'Crowded tables. Left when conditions deteriorated.',
    // created at to handle the created at
    createdAt: now,
    updatedAt: now,
  },
  {
    // id to handle the id
    id: 'sample-1',
    // date to handle the date
    date: '2026-07-10',
    // location to handle the location
    location: 'Northstar Casino',
    // starting bankroll to handle the starting bankroll
    startingBankroll: 5000,
    // buy in to handle the buy in
    buyIn: 800,
    // cash out to handle the cash out
    cashOut: 1500,
    hoursPlayed: 4.75,
    netResult: 700,
    notes: 'First tracked session.',
    // created at to handle the created at
    createdAt: now,
    // updated at to handle the updated at
    updatedAt: now,
  },
];
