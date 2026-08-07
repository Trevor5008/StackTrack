import { DeckCount, TableRules } from '@/src/types/tableRules';

/** Baseline HE% for 6D / 3:2 / S17 / DAS / no late surrender. */
export const BASELINE_HOUSE_EDGE = 0.5;

const DECK_DELTA: Record<DeckCount, number> = {
  1: -0.15,
  2: -0.1,
  4: -0.05,
  6: 0,
  8: 0.02,
  10: 0.03,
  12: 0.04,
};

export type FavorabilityTier = 'favorable' | 'average' | 'unfavorable';

/**
 * Approximate house edge (%) from rule deltas.
 * For ranking UI only — not a full combinatorial simulator.
 */
export function estimateHouseEdge(rules: TableRules): number {
  let edge = BASELINE_HOUSE_EDGE;
  edge += DECK_DELTA[rules.decks] ?? 0;
  if (rules.blackjackPayout === '6:5') edge += 1.4;
  if (rules.dealer17 === 'H17') edge += 0.22;
  if (!rules.doubleAfterSplit) edge += 0.14;
  if (rules.lateSurrender) edge -= 0.08;
  return Math.round(edge * 100) / 100;
}

export function favorabilityTier(houseEdge: number): FavorabilityTier {
  if (houseEdge <= 0.45) return 'favorable';
  if (houseEdge <= 0.7) return 'average';
  return 'unfavorable';
}

export function formatHouseEdge(houseEdge: number): string {
  return `${houseEdge.toFixed(2)}%`;
}
