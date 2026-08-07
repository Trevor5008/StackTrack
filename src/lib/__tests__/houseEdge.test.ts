import {
  BASELINE_HOUSE_EDGE,
  estimateHouseEdge,
  favorabilityTier,
  formatHouseEdge,
} from '@/src/lib/houseEdge';
import { rankTables } from '@/src/lib/tableRanking';
import { defaultTableRules, serializeTableRules } from '@/src/lib/tableRules';
import { TableRules } from '@/src/types/tableRules';

describe('houseEdge', () => {
  test('baseline rules ≈ 0.50%', () => {
    expect(estimateHouseEdge(defaultTableRules())).toBe(BASELINE_HOUSE_EDGE);
    expect(favorabilityTier(BASELINE_HOUSE_EDGE)).toBe('average');
  });

  test('6:5 pushes unfavorable', () => {
    const rules: TableRules = {
      ...defaultTableRules(),
      blackjackPayout: '6:5',
    };
    const edge = estimateHouseEdge(rules);
    expect(edge).toBeCloseTo(1.9, 2);
    expect(favorabilityTier(edge)).toBe('unfavorable');
  });

  test('late surrender improves edge', () => {
    const withLs: TableRules = {
      ...defaultTableRules(),
      lateSurrender: true,
    };
    expect(estimateHouseEdge(withLs)).toBeCloseTo(0.42, 2);
    expect(favorabilityTier(estimateHouseEdge(withLs))).toBe('favorable');
  });

  test('formatHouseEdge', () => {
    expect(formatHouseEdge(0.5)).toBe('0.50%');
  });
});

describe('rankTables', () => {
  test('missing rules → null tier, never best', () => {
    const ranks = rankTables([{ id: 'a', rulesJson: null }]);
    expect(ranks.get('a')).toEqual({
      houseEdge: null,
      tier: null,
      isBest: false,
    });
  });

  test('unique best among scored tables', () => {
    const good = serializeTableRules({
      ...defaultTableRules(),
      lateSurrender: true,
    });
    const bad = serializeTableRules({
      ...defaultTableRules(),
      blackjackPayout: '6:5',
    });
    const ranks = rankTables([
      { id: 'good', rulesJson: good },
      { id: 'bad', rulesJson: bad },
      { id: 'none', rulesJson: null },
    ]);
    expect(ranks.get('good')?.isBest).toBe(true);
    expect(ranks.get('bad')?.isBest).toBe(false);
    expect(ranks.get('none')?.isBest).toBe(false);
  });

  test('ties for lowest HE → no exclusive best', () => {
    const same = serializeTableRules(defaultTableRules());
    const ranks = rankTables([
      { id: 'a', rulesJson: same },
      { id: 'b', rulesJson: same },
    ]);
    expect(ranks.get('a')?.isBest).toBe(false);
    expect(ranks.get('b')?.isBest).toBe(false);
  });

  test('single table with rules is best when not unfavorable', () => {
    const ranks = rankTables([
      { id: 'only', rulesJson: serializeTableRules(defaultTableRules()) },
    ]);
    expect(ranks.get('only')?.tier).toBe('average');
    expect(ranks.get('only')?.isBest).toBe(true);
  });

  test('unfavorable winner is never framed as best', () => {
    const worse = serializeTableRules({
      ...defaultTableRules(),
      blackjackPayout: '6:5',
      dealer17: 'H17',
    });
    const bad = serializeTableRules({
      ...defaultTableRules(),
      blackjackPayout: '6:5',
    });
    const ranks = rankTables([
      { id: 'leastBad', rulesJson: bad },
      { id: 'worse', rulesJson: worse },
    ]);
    expect(ranks.get('leastBad')?.tier).toBe('unfavorable');
    expect(ranks.get('leastBad')?.isBest).toBe(false);
    expect(ranks.get('worse')?.isBest).toBe(false);
  });
});
