import {
  defaultTableRules,
  formatTableRulesSummary,
  isTableRules,
  parseTableRules,
  serializeTableRules,
} from '@/src/lib/tableRules';

describe('tableRules', () => {
  test('defaultTableRules uses Vegas-ish defaults', () => {
    expect(defaultTableRules()).toEqual({
      decks: 6,
      blackjackPayout: '3:2',
      dealer17: 'S17',
      doubleAfterSplit: true,
      lateSurrender: false,
      minimumBet: 25,
    });
  });

  test('serialize and parse round-trip', () => {
    const rules = {
      ...defaultTableRules(),
      decks: 2 as const,
      blackjackPayout: '6:5' as const,
      dealer17: 'H17' as const,
      doubleAfterSplit: false,
      lateSurrender: true,
      minimumBet: 50,
    };
    const json = serializeTableRules(rules);
    expect(parseTableRules(json)).toEqual(rules);
  });

  test('parseTableRules fills default minimumBet for legacy JSON', () => {
    const legacy = {
      decks: 6,
      blackjackPayout: '3:2',
      dealer17: 'S17',
      doubleAfterSplit: true,
      lateSurrender: false,
    };
    expect(parseTableRules(JSON.stringify(legacy))).toEqual({
      ...legacy,
      minimumBet: 25,
    });
  });

  test('parseTableRules returns null for invalid input', () => {
    expect(parseTableRules(null)).toBeNull();
    expect(parseTableRules('')).toBeNull();
    expect(parseTableRules('not-json')).toBeNull();
    expect(parseTableRules('{"decks":3}')).toBeNull();
    expect(parseTableRules(JSON.stringify({ ...defaultTableRules(), decks: 3 }))).toBeNull();
  });

  test('isTableRules rejects partial objects', () => {
    expect(isTableRules(null)).toBe(false);
    expect(isTableRules({ decks: 6 })).toBe(false);
    expect(isTableRules(defaultTableRules())).toBe(true);
  });

  test('formatTableRulesSummary is compact', () => {
    expect(formatTableRulesSummary(defaultTableRules())).toBe(
      '6D · 3:2 · S17 · DAS · no LS',
    );
  });
});
