import {
  BlackjackPayout,
  Dealer17,
  DeckCount,
  TableRules,
} from '@/src/types/tableRules';

const DECKS: readonly DeckCount[] = [1, 2, 4, 6, 8, 10, 12];
const PAYOUTS: readonly BlackjackPayout[] = ['3:2', '6:5'];
const DEALER17: readonly Dealer17[] = ['S17', 'H17'];

export function defaultTableRules(): TableRules {
  return {
    decks: 6,
    blackjackPayout: '3:2',
    dealer17: 'S17',
    doubleAfterSplit: true,
    lateSurrender: false,
  };
}

function isDeckCount(value: unknown): value is DeckCount {
  return typeof value === 'number' && (DECKS as readonly number[]).includes(value);
}

function isBlackjackPayout(value: unknown): value is BlackjackPayout {
  return typeof value === 'string' && (PAYOUTS as readonly string[]).includes(value);
}

function isDealer17(value: unknown): value is Dealer17 {
  return typeof value === 'string' && (DEALER17 as readonly string[]).includes(value);
}

export function isTableRules(value: unknown): value is TableRules {
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

/** Parse stored JSON; invalid / legacy / null → null. */
export function parseTableRules(json: string | null | undefined): TableRules | null {
  if (json == null || !json.trim()) return null;
  try {
    const parsed: unknown = JSON.parse(json);
    return isTableRules(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function serializeTableRules(rules: TableRules): string {
  if (!isTableRules(rules)) {
    throw new Error('Cannot serialize invalid table rules.');
  }
  return JSON.stringify(rules);
}

/** Compact one-line summary for buttons and detail views. */
export function formatTableRulesSummary(rules: TableRules): string {
  const das = rules.doubleAfterSplit ? 'DAS' : 'no DAS';
  const ls = rules.lateSurrender ? 'LS' : 'no LS';
  return `${rules.decks}D · ${rules.blackjackPayout} · ${rules.dealer17} · ${das} · ${ls}`;
}
