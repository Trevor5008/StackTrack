import { Session } from '@/src/types/session';

const now = new Date().toISOString();

export const sampleSessions: Session[] = [
  {
    id: 'sample-3',
    date: '2026-07-24',
    location: 'Riverside Casino',
    startingBankroll: 5525,
    buyIn: 500,
    cashOut: 775,
    hoursPlayed: 3.5,
    netResult: 275,
    notes: 'Good shoe selection and a disciplined stop.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample-2',
    date: '2026-07-18',
    location: 'Grand Harbor',
    startingBankroll: 5700,
    buyIn: 600,
    cashOut: 425,
    hoursPlayed: 2.25,
    netResult: -175,
    notes: 'Crowded tables. Left when conditions deteriorated.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'sample-1',
    date: '2026-07-10',
    location: 'Northstar Casino',
    startingBankroll: 5000,
    buyIn: 800,
    cashOut: 1500,
    hoursPlayed: 4.75,
    netResult: 700,
    notes: 'First tracked session.',
    createdAt: now,
    updatedAt: now,
  },
];
