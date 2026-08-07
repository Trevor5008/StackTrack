export type BlackjackPayout = '3:2' | '6:5';
export type Dealer17 = 'S17' | 'H17';
export type DeckCount = 1 | 2 | 4 | 6 | 8 | 10 | 12;

export type TableRules = {
  decks: DeckCount;
  blackjackPayout: BlackjackPayout;
  dealer17: Dealer17;
  doubleAfterSplit: boolean;
  lateSurrender: boolean;
};

export const DECK_OPTIONS: DeckCount[] = [1, 2, 4, 6, 8, 10, 12];
export const PAYOUT_OPTIONS: BlackjackPayout[] = ['3:2', '6:5'];
export const DEALER17_OPTIONS: Dealer17[] = ['S17', 'H17'];
