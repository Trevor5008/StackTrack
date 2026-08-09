import { estimateHouseEdge } from '@/src/lib/houseEdge';
import { TableRules } from '@/src/types/tableRules';

/** Allowed session risk-tolerance presets (%). */
export const RISK_TOLERANCE_PRESETS = [1, 2, 5, 10, 20, 25, 40] as const;

export type RiskTolerancePreset = (typeof RISK_TOLERANCE_PRESETS)[number];

export const DEFAULT_RISK_TOLERANCE: RiskTolerancePreset = 5;

/** Scale factor for the BS RoR heuristic (units / (scale * HE)). */
export const ROR_HE_SCALE = 10;

export type RoREstimate = {
  rorPct: number;
  units: number;
  houseEdge: number;
};

export function isRiskTolerancePreset(
  value: number,
): value is RiskTolerancePreset {
  return (RISK_TOLERANCE_PRESETS as readonly number[]).includes(value);
}

export function assertRiskTolerance(value: number): RiskTolerancePreset {
  if (!isRiskTolerancePreset(value)) {
    throw new Error('Pick a risk tolerance from the preset list.');
  }
  return value;
}

export function assertBettingUnit(
  bettingUnit: number,
  minimumBet: number,
): void {
  if (!Number.isFinite(bettingUnit) || bettingUnit <= 0) {
    throw new Error('Enter a betting unit greater than zero.');
  }
  if (!Number.isFinite(minimumBet) || bettingUnit < minimumBet) {
    throw new Error('Betting unit cannot be below the table minimum.');
  }
}

/**
 * Approximate basic-strategy RoR (%).
 * Unknown until rules and betting unit are both set.
 * Higher units and lower HE → lower estimated RoR.
 */
export function estimateBasicStrategyRoR(input: {
  remainingBudget: number;
  bettingUnit: number | null | undefined;
  rules: TableRules | null | undefined;
}): RoREstimate | null {
  const { remainingBudget, bettingUnit, rules } = input;
  if (!rules || bettingUnit == null || !Number.isFinite(bettingUnit)) {
    return null;
  }
  if (bettingUnit <= 0 || !Number.isFinite(remainingBudget)) {
    return null;
  }

  const houseEdge = estimateHouseEdge(rules);
  const units = remainingBudget / bettingUnit;
  if (!Number.isFinite(units) || units < 0) {
    return null;
  }

  const heFloor = Math.max(houseEdge, 0.05);
  const raw = 100 * Math.exp(-units / (ROR_HE_SCALE * heFloor));
  const rorPct = Math.min(99.9, Math.max(0.1, Math.round(raw * 10) / 10));

  return {
    rorPct,
    units: Math.round(units * 100) / 100,
    houseEdge,
  };
}

export function isTableViable(
  rorPct: number,
  riskTolerance: number,
): boolean {
  return rorPct <= riskTolerance;
}

export function formatRoR(rorPct: number | null | undefined): string {
  if (rorPct == null || !Number.isFinite(rorPct)) return '—';
  return `${rorPct.toFixed(1)}%`;
}
