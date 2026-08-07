import type { SQLiteBindValue } from 'expo-sqlite';

import { AppSettings, Session } from '@/src/types/session';

export type SessionRow = {
  id: string;
  date: string;
  location: string;
  casino_id: string | null;
  starting_bankroll: number;
  buy_in: number;
  cash_out: number;
  hours_played: number;
  net_result: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SettingsRow = {
  id: number;
  starting_bankroll: number;
  currency: string;
};

export function sessionFromRow(row: SessionRow): Session {
  return {
    id: row.id,
    date: row.date,
    location: row.location,
    casinoId: row.casino_id ?? '',
    startingBankroll: row.starting_bankroll,
    buyIn: row.buy_in,
    cashOut: row.cash_out,
    hoursPlayed: row.hours_played,
    netResult: row.net_result,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function sessionInsertParams(session: Session): SQLiteBindValue[] {
  return [
    session.id,
    session.date,
    session.location,
    session.casinoId,
    session.startingBankroll,
    session.buyIn,
    session.cashOut,
    session.hoursPlayed,
    session.netResult,
    session.notes ?? null,
    session.createdAt,
    session.updatedAt,
  ];
}

export function settingsFromRow(row: SettingsRow): AppSettings {
  return {
    startingBankroll: row.starting_bankroll,
    currency: row.currency,
  };
}
