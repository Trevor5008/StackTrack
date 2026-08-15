import {
  BlackjackPayout,
  Dealer17,
  DeckCount,
  TableRules,
} from '@/src/types/tableRules';

const DECKS: readonly DeckCount[] = [1, 2, 4, 6, 8, 10, 12];
const PAYOUTS: readonly BlackjackPayout[] = ['3:2', '6:5'];
const DEALER17: readonly Dealer17[] = ['S17', 'H17'];
const DEFAULT_MINIMUM_BET = 25;

// Default table rules
export function defaultTableRules(): TableRules {
  return {
    decks: 6,
    blackjackPayout: '3:2',
    dealer17: 'S17',
    doubleAfterSplit: true,
    lateSurrender: false,
    minimumBet: DEFAULT_MINIMUM_BET,
  };
}

// Helper functions for verifying table rules

function isDeckCount(value: unknown): value is DeckCount {
  return typeof value === 'number' && (DECKS as readonly number[]).includes(value);
}

function isBlackjackPayout(value: unknown): value is BlackjackPayout {
  return typeof value === 'string' && (PAYOUTS as readonly string[]).includes(value);
}

function isDealer17(value: unknown): value is Dealer17 {
  return typeof value === 'string' && (DEALER17 as readonly string[]).includes(value);
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/** Core rules fields (minimumBet may be filled during parse for legacy rows). */
function isTableRulesCore(value: unknown): value is Omit<TableRules, 'minimumBet'> {
  if (!value || typeof value !== 'object') return false;
  const rules = value as Partial<TableRules>;
  return (
    isDeckCount(rules.decks) &&
    isBlackjackPayout(rules.blackjackPayout) &&
    isDealer17(rules.dealer17) &&
    typeof rules.doubleAfterSplit === 'boolean' &&
    typeof rules.lateSurrender === 'boolean'
  );
}

// Verify table rules are set and valid
export function isTableRules(value: unknown): value is TableRules {
  if (!isTableRulesCore(value)) return false;
  return isNonNegativeNumber((value as Partial<TableRules>).minimumBet);
}

// Normalize the minimum bet to a valid number
function normalizeMinimumBet(value: unknown): number {
  return isNonNegativeNumber(value) ? value : DEFAULT_MINIMUM_BET;
}

/** Parse stored JSON; invalid / null → null. Legacy rows without minimumBet get the default. */
export function parseTableRules(json: string | null | undefined): TableRules | null {
  if (json == null || !json.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    if (!isTableRulesCore(parsed)) return null;
    const core = parsed as Omit<TableRules, 'minimumBet'> & {
      minimumBet?: unknown;
    };
    return {
      decks: core.decks,
      blackjackPayout: core.blackjackPayout,
      dealer17: core.dealer17,
      doubleAfterSplit: core.doubleAfterSplit,
      lateSurrender: core.lateSurrender,
      minimumBet: normalizeMinimumBet(core.minimumBet),
    };
  } catch {
    return null;
  }
}

// Serialize the table rules to a JSON string
export function serializeTableRules(rules: TableRules): string {
  if (!isTableRules(rules)) {
    throw new Error('Cannot serialize invalid table rules.');
  }
  // return the JSON string of the rules
  return JSON.stringify(rules);
}

/** Compact one-line summary for buttons and detail views. */
export function formatTableRulesSummary(rules: TableRules): string {
  const das = rules.doubleAfterSplit ? 'DAS' : 'no DAS';
  const ls = rules.lateSurrender ? 'LS' : 'no LS';
  return `${rules.decks}D · ${rules.blackjackPayout} · ${rules.dealer17} · ${das} · ${ls}`;
}
