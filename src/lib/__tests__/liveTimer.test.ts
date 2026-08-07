import {
  computeElapsedMs,
  formatElapsed,
  msToHoursPlayed,
} from '@/src/lib/liveTimer';

describe('liveTimer', () => {
  test('computeElapsedMs accumulates running segment', () => {
    const start = Date.parse('2026-08-06T12:00:00.000Z');
    const now = start + 5_000;
    expect(
      computeElapsedMs({
        accumulatedMs: 10_000,
        isPaused: false,
        segmentStartedAt: new Date(start).toISOString(),
        nowMs: now,
      }),
    ).toBe(15_000);
  });

  test('computeElapsedMs freezes while paused', () => {
    expect(
      computeElapsedMs({
        accumulatedMs: 42_000,
        isPaused: true,
        segmentStartedAt: '2026-08-06T12:00:00.000Z',
        nowMs: Date.parse('2026-08-06T13:00:00.000Z'),
      }),
    ).toBe(42_000);
  });

  test('msToHoursPlayed rounds to two decimals', () => {
    expect(msToHoursPlayed(3_600_000)).toBe(1);
    expect(msToHoursPlayed(1_800_000)).toBe(0.5);
    expect(msToHoursPlayed(3_660_000)).toBe(1.02);
  });

  test('formatElapsed pads hh:mm:ss', () => {
    expect(formatElapsed(0)).toBe('00:00:00');
    expect(formatElapsed(3_661_000)).toBe('01:01:01');
  });
});
