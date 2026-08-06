import {
  assertSessionInput,
  isAppSettings,
  isSession,
  normalizeSession,
  parseSessionsPayload,
  parseSettingsPayload,
} from '../validators';

const validSession = {
  id: 's1',
  date: '2026-07-24',
  location: 'Riverside Casino',
  startingBankroll: 5000,
  buyIn: 500,
  cashOut: 700,
  hoursPlayed: 2,
  netResult: 999,
  createdAt: '2026-07-24T12:00:00.000Z',
  updatedAt: '2026-07-24T12:00:00.000Z',
};

describe('storage validators', () => {
  test('isSession accepts valid records and rejects bad dates', () => {
    expect(isSession(validSession)).toBe(true);
    expect(isSession({ ...validSession, date: '2026-13-40' })).toBe(false);
    expect(isSession({ ...validSession, hoursPlayed: 0 })).toBe(false);
  });

  test('normalizeSession recomputes netResult', () => {
    expect(normalizeSession(validSession as never).netResult).toBe(200);
  });

  test('parseSessionsPayload migrates legacy arrays and drops invalid rows', () => {
    const result = parseSessionsPayload(
      JSON.stringify([validSession, { id: 'bad' }]),
    );
    expect(result.sessions).toHaveLength(1);
    expect(result.sessions[0].netResult).toBe(200);
    expect(result.migrated).toBe(true);
    expect(result.warning).toMatch(/Skipped 1 invalid session/);
  });

  test('parseSessionsPayload accepts versioned envelopes', () => {
    const result = parseSessionsPayload(
      JSON.stringify({ version: 1, sessions: [validSession] }),
    );
    expect(result.sessions).toHaveLength(1);
    expect(result.migrated).toBe(false);
    expect(result.warning).toBeNull();
  });

  test('parseSessionsPayload handles corrupt JSON', () => {
    const result = parseSessionsPayload('{not-json');
    expect(result.sessions).toEqual([]);
    expect(result.warning).toMatch(/corrupt/i);
  });

  test('isAppSettings and parseSettingsPayload restore defaults on invalid data', () => {
    expect(isAppSettings({ startingBankroll: 1000, currency: 'USD' })).toBe(
      true,
    );
    const fallback = { startingBankroll: 5000, currency: 'USD' };
    const result = parseSettingsPayload('null', fallback);
    expect(result.settings).toEqual(fallback);
    expect(result.warning).toMatch(/invalid/i);
  });

  test('assertSessionInput validates write payloads', () => {
    expect(() =>
      assertSessionInput({
        date: '2026-07-24',
        location: '  Northstar  ',
        startingBankroll: 5000,
        buyIn: 100,
        cashOut: 50,
        hoursPlayed: 1,
      }),
    ).not.toThrow();

    expect(() =>
      assertSessionInput({
        date: 'bad',
        location: 'Casino',
        startingBankroll: 5000,
        buyIn: 100,
        cashOut: 50,
        hoursPlayed: 1,
      }),
    ).toThrow(/YYYY-MM-DD/);
  });
});
