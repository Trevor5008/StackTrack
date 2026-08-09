import type { StartLiveSessionInput } from '../../types/liveSession';

describe('StartLiveSessionInput', () => {
  test('requires casino, bankroll, budget, and risk tolerance', () => {
    const input: StartLiveSessionInput = {
      casinoId: 'c1',
      startingBankroll: 5000,
      budget: 500,
      riskTolerance: 5,
    };
    expect(Object.keys(input).sort()).toEqual([
      'budget',
      'casinoId',
      'riskTolerance',
      'startingBankroll',
    ]);
  });
});
