import { describe, expect, it } from 'vitest';
import { MAX_VERIFICATION_AGE_DAYS, isStale } from './staleness';
import { date } from './test-fixtures';

describe('isStale', () => {
  it('uses a 183-day window', () => {
    expect(MAX_VERIFICATION_AGE_DAYS).toBe(183);
  });

  it('is fresh when checked today', () => {
    expect(isStale(date('2026-10-22'), date('2026-10-22'))).toBe(false);
  });

  it('is fresh at exactly 183 days old', () => {
    expect(isStale(date('2026-04-22'), date('2026-10-22'))).toBe(false);
  });

  it('is stale at 184 days old', () => {
    expect(isStale(date('2026-04-21'), date('2026-10-22'))).toBe(true);
  });

  it('counts across a year boundary', () => {
    expect(isStale(date('2025-12-31'), date('2026-07-02'))).toBe(false);
    expect(isStale(date('2025-12-31'), date('2026-07-03'))).toBe(true);
  });

  it('is unaffected by daylight-saving changes between the two dates', () => {
    expect(isStale(date('2026-03-01'), date('2026-08-31'))).toBe(false);
  });
});
