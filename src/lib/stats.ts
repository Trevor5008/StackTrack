import { Session, WinLossRecord } from '@/src/types/session';

export function lifetimeProfitLoss(sessions: Session[]): number {
  return sessions.reduce((total, session) => total + session.netResult, 0);
}

export function currentBankroll(
  startingBankroll: number,
  sessions: Session[],
): number {
  return startingBankroll + lifetimeProfitLoss(sessions);
}

export function totalSessions(sessions: Session[]): number {
  return sessions.length;
}

export function totalHours(sessions: Session[]): number {
  return sessions.reduce(
    (total, session) => total + session.hoursPlayed,
    0,
  );
}

export function hourlyRate(sessions: Session[]): number {
  const hours = totalHours(sessions);
  return hours === 0 ? 0 : lifetimeProfitLoss(sessions) / hours;
}

export function winLossRecord(sessions: Session[]): WinLossRecord {
  return sessions.reduce<WinLossRecord>(
    (record, session) => {
      if (session.netResult > 0) record.wins += 1;
      else if (session.netResult < 0) record.losses += 1;
      else record.pushes += 1;
      return record;
    },
    { wins: 0, losses: 0, pushes: 0 },
  );
}

export function biggestWin(sessions: Session[]): number {
  return sessions.reduce(
    (biggest, session) => Math.max(biggest, session.netResult),
    0,
  );
}

export function biggestLoss(sessions: Session[]): number {
  return sessions.reduce(
    (biggest, session) => Math.min(biggest, session.netResult),
    0,
  );
}
