import { sessionFromRow, sessionInsertParams, settingsFromRow } from '../mappers';

describe('sqlite row mappers', () => {
  test('sessionFromRow maps snake_case columns', () => {
    const session = sessionFromRow({
      id: 's1',
      date: '2026-07-24',
      location: 'Riverside',
      starting_bankroll: 5000,
      buy_in: 500,
      cash_out: 700,
      hours_played: 2,
      net_result: 200,
      notes: null,
      created_at: '2026-07-24T12:00:00.000Z',
      updated_at: '2026-07-24T12:00:00.000Z',
    });

    expect(session).toEqual({
      id: 's1',
      date: '2026-07-24',
      location: 'Riverside',
      startingBankroll: 5000,
      buyIn: 500,
      cashOut: 700,
      hoursPlayed: 2,
      netResult: 200,
      notes: undefined,
      createdAt: '2026-07-24T12:00:00.000Z',
      updatedAt: '2026-07-24T12:00:00.000Z',
    });
  });

  test('sessionInsertParams preserves order for SQL binds', () => {
    const params = sessionInsertParams({
      id: 's1',
      date: '2026-07-24',
      location: 'Riverside',
      startingBankroll: 5000,
      buyIn: 500,
      cashOut: 700,
      hoursPlayed: 2,
      netResult: 200,
      notes: 'note',
      createdAt: 'a',
      updatedAt: 'b',
    });
    expect(params).toEqual([
      's1',
      '2026-07-24',
      'Riverside',
      5000,
      500,
      700,
      2,
      200,
      'note',
      'a',
      'b',
    ]);
  });

  test('settingsFromRow maps singleton settings', () => {
    expect(
      settingsFromRow({ id: 1, starting_bankroll: 2500, currency: 'CAD' }),
    ).toEqual({ startingBankroll: 2500, currency: 'CAD' });
  });
});
