import { casinoNameKey } from '../casinoName';
import { lifetimeProfitLoss, sessionsForCasino } from '../stats';
import { Session } from '@/src/types/session';

const sessions: Session[] = [
  {
    id: '1',
    date: '2026-07-01',
    location: 'Riverside',
    casinoId: 'c1',
    startingBankroll: 5000,
    buyIn: 200,
    cashOut: 300,
    hoursPlayed: 2,
    netResult: 100,
    createdAt: 'a',
    updatedAt: 'a',
  },
  {
    id: '2',
    date: '2026-07-02',
    location: 'Harbor',
    casinoId: 'c2',
    startingBankroll: 5100,
    buyIn: 200,
    cashOut: 100,
    hoursPlayed: 1,
    netResult: -100,
    createdAt: 'b',
    updatedAt: 'b',
  },
  {
    id: '3',
    date: '2026-07-03',
    location: 'Riverside',
    casinoId: 'c1',
    startingBankroll: 5000,
    buyIn: 100,
    cashOut: 150,
    hoursPlayed: 1,
    netResult: 50,
    createdAt: 'c',
    updatedAt: 'c',
  },
];

describe('casino-scoped stats', () => {
  test('sessionsForCasino filters by casinoId', () => {
    const scoped = sessionsForCasino(sessions, 'c1');
    expect(scoped).toHaveLength(2);
    expect(lifetimeProfitLoss(scoped)).toBe(150);
  });

  test('sessionsForCasino returns empty for unknown casino', () => {
    expect(sessionsForCasino(sessions, 'missing')).toEqual([]);
  });
});

describe('casinoNameKey', () => {
  test('trims and lowercases for migration uniqueness', () => {
    expect(casinoNameKey('  Riverside Casino ')).toBe('riverside casino');
    expect(casinoNameKey('RIVERSIDE CASINO')).toBe(
      casinoNameKey('riverside casino'),
    );
  });
});
