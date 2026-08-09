import {
  assertBudget,
  assertEndingChips,
  assertStake,
  computeRemainingBudget,
  hasOpenStake,
} from '@/src/lib/sessionBudget';

describe('sessionBudget', () => {
  test('assertBudget rejects over bankroll and non-positive', () => {
    expect(() => assertBudget(100, 50)).toThrow(/cannot exceed/);
    expect(() => assertBudget(0, 50)).toThrow(/greater than zero/);
    expect(() => assertBudget(25, 50)).not.toThrow();
  });

  test('assertStake rejects over remaining', () => {
    expect(() => assertStake(200, 100)).toThrow(/cannot exceed/);
    expect(() => assertStake(0, 100)).toThrow(/greater than zero/);
    expect(() => assertStake(50, 100)).not.toThrow();
  });

  test('assertEndingChips allows zero', () => {
    expect(() => assertEndingChips(-1)).toThrow(/ending chip/);
    expect(() => assertEndingChips(0)).not.toThrow();
    expect(() => assertEndingChips(80)).not.toThrow();
  });

  test('computeRemainingBudget applies nets and stakes', () => {
    expect(
      computeRemainingBudget(500, [
        { netResult: -20, stake: 0 },
        { netResult: 10, stake: 100 },
      ]),
    ).toBe(390);
  });

  test('pause then settle matches budget + nets', () => {
    const budget = 500;
    // Play 100: remaining 400
    let tables = [{ netResult: 0, stake: 100 }];
    expect(computeRemainingBudget(budget, tables)).toBe(400);
    // Pause ending 80 → net -20, stake 0 → remaining 480
    tables = [{ netResult: -20, stake: 0 }];
    expect(computeRemainingBudget(budget, tables)).toBe(480);
    // End cash-out is remaining; session net = cashOut - buyIn
    const cashOut = computeRemainingBudget(budget, tables);
    expect(cashOut - budget).toBe(-20);
  });

  test('hasOpenStake blocks end while chips are out', () => {
    expect(hasOpenStake([{ netResult: 0, stake: 50 }])).toBe(true);
    expect(hasOpenStake([{ netResult: -10, stake: 0 }])).toBe(false);
  });
});
