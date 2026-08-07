import type { EndLiveSessionInput } from '../../types/liveSession';

describe('EndLiveSessionInput', () => {
  test('requires buy-in and cash-out only (no location)', () => {
    const input: EndLiveSessionInput = { buyIn: 500, cashOut: 700 };
    expect(Object.keys(input).sort()).toEqual(['buyIn', 'cashOut']);
  });
});
