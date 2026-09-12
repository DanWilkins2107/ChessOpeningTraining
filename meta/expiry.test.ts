import { describe, expect, it } from 'vitest';
import { expiryProblem, startOfTodayUtc } from './expiry';

const DAY_MS = 86_400_000;

describe('expiryProblem', () => {
  const today = new Date(Date.UTC(2026, 0, 1));
  const cases: [string, string | null][] = [
    ['2026-01-15', null],
    ['2026-01-01', null],
    ['2026-01-31', null],
    ['2026-02-01', 'expiry 2026-02-01 is more than 30 days out'],
    ['2025-12-31', 'expiry 2025-12-31 has passed'],
    ['2026-02-30', 'expiry 2026-02-30 is not a real date'],
    ['2026-1-15', 'expiry 2026-1-15 is not a real date'],
    ['tomorrow', 'expiry tomorrow is not a real date'],
    ['', 'expiry  is not a real date'],
  ];

  it.each(cases)('%s', (expiryText, problem) => {
    expect(expiryProblem(expiryText, today)).toBe(problem);
  });
});

describe('startOfTodayUtc', () => {
  it('is midnight on the UTC day in progress', () => {
    const elapsed = Date.now() - startOfTodayUtc().getTime();

    expect(startOfTodayUtc().toISOString()).toMatch(/T00:00:00\.000Z$/);
    expect(elapsed).toBeGreaterThanOrEqual(0);
    expect(elapsed).toBeLessThan(DAY_MS);
  });
});
