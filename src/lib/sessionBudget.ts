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

/** Chips still yours this session: remaining + open stakes (= budget + nets). */
export function computeSessionBankroll(
  budget: number,
  tables: BudgetTableLike[],
): number {
  const nets = tables.reduce((sum, table) => sum + table.netResult, 0);
  return Math.round((budget + nets) * 100) / 100;
}

export function assertBudget(budget: number, bankroll: number): void {
  if (!Number.isFinite(budget) || budget <= 0) {
    throw new Error('Enter a budget greater than zero.');
  }
  if (!Number.isFinite(bankroll) || budget > bankroll) {
    throw new Error('Budget cannot exceed your current bankroll.');
  }
}

// Stake is valid if it is a number and <= remaining session budget
export function assertStake(stake: number, remainingBudget: number): void {
  if (!Number.isFinite(stake) || stake <= 0) {
    throw new Error('Enter a stake greater than zero.');
  }
  if (!Number.isFinite(remainingBudget) || stake > remainingBudget) {
    throw new Error('Stake cannot exceed your remaining budget.');
  }
}

// Asserts that ending chips is a valid number and greater than or equal to zero
export function assertEndingChips(endingChips: number): void {
  if (!Number.isFinite(endingChips) || endingChips < 0) {
    throw new Error('Enter a valid ending chip count.');
  }
}

// Checks if there is any open stake in the tables
export function hasOpenStake(tables: BudgetTableLike[]): boolean {
  return tables.some((table) => table.stake > 0);
}
