export type BudgetTableLike = {
  netResult: number;
  stake: number;
};

/** remaining = budget + sum(netResult) - sum(stake) */
export function computeRemainingBudget(
  budget: number,
  tables: BudgetTableLike[],
): number {
  const nets = tables.reduce((sum, table) => sum + table.netResult, 0);
  const stakes = tables.reduce((sum, table) => sum + table.stake, 0);
  return Math.round((budget + nets - stakes) * 100) / 100;
}

export function assertBudget(budget: number, bankroll: number): void {
  if (!Number.isFinite(budget) || budget <= 0) {
    throw new Error('Enter a budget greater than zero.');
  }
  if (!Number.isFinite(bankroll) || budget > bankroll) {
    throw new Error('Budget cannot exceed your current bankroll.');
  }
}

export function assertStake(stake: number, remainingBudget: number): void {
  if (!Number.isFinite(stake) || stake <= 0) {
    throw new Error('Enter a stake greater than zero.');
  }
  if (!Number.isFinite(remainingBudget) || stake > remainingBudget) {
    throw new Error('Stake cannot exceed your remaining budget.');
  }
}

export function assertEndingChips(endingChips: number): void {
  if (!Number.isFinite(endingChips) || endingChips < 0) {
    throw new Error('Enter a valid ending chip count.');
  }
}

export function hasOpenStake(tables: BudgetTableLike[]): boolean {
  return tables.some((table) => table.stake > 0);
}
