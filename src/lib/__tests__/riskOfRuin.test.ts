import {
  assertBettingUnit,
  assertRiskTolerance,
  estimateBasicStrategyRoR,
  formatRoR,
  isTableViable,
  RISK_TOLERANCE_PRESETS,
} from '@/src/lib/riskOfRuin';
import { defaultTableRules } from '@/src/lib/tableRules';

describe('riskOfRuin', () => {
  const rules = defaultTableRules();

  test('unknown without rules or betting unit', () => {
    expect(
      estimateBasicStrategyRoR({
        remainingBudget: 500,
        bettingUnit: null,
        rules,
      }),
    ).toBeNull();
    expect(
      estimateBasicStrategyRoR({
        remainingBudget: 500,
        bettingUnit: 25,
        rules: null,
      }),
    ).toBeNull();
  });

  test('formula is lower with more units', () => {
    const shallow = estimateBasicStrategyRoR({
      remainingBudget: 250,
      bettingUnit: 25,
      rules,
    });
    const deep = estimateBasicStrategyRoR({
      remainingBudget: 2500,
      bettingUnit: 25,
      rules,
    });
    expect(shallow).not.toBeNull();
    expect(deep).not.toBeNull();
    expect(deep!.rorPct).toBeLessThan(shallow!.rorPct);
  });

  test('higher house edge raises estimated RoR', () => {
    const soft = estimateBasicStrategyRoR({
      remainingBudget: 500,
      bettingUnit: 25,
      rules: { ...rules, blackjackPayout: '3:2' },
    });
    const harsh = estimateBasicStrategyRoR({
      remainingBudget: 500,
      bettingUnit: 25,
      rules: { ...rules, blackjackPayout: '6:5' },
    });
    expect(soft).not.toBeNull();
    expect(harsh).not.toBeNull();
    expect(harsh!.rorPct).toBeGreaterThan(soft!.rorPct);
  });

  test('viable when RoR at or below tolerance', () => {
    expect(isTableViable(4.9, 5)).toBe(true);
    expect(isTableViable(5, 5)).toBe(true);
    expect(isTableViable(5.1, 5)).toBe(false);
  });

  test('assertBettingUnit rejects below minimum', () => {
    expect(() => assertBettingUnit(10, 25)).toThrow(/table minimum/);
    expect(() => assertBettingUnit(25, 25)).not.toThrow();
  });

  test('assertRiskTolerance only allows presets', () => {
    expect(assertRiskTolerance(5)).toBe(5);
    expect(() => assertRiskTolerance(3)).toThrow(/preset/);
    expect(RISK_TOLERANCE_PRESETS).toContain(40);
  });

  test('formatRoR handles unknown', () => {
    expect(formatRoR(null)).toBe('—');
    expect(formatRoR(12.34)).toBe('12.3%');
  });
});
