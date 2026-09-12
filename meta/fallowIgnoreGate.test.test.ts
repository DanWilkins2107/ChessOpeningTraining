import { describe, expect, it } from 'vitest';
import { reasonProblem } from './fallowIgnoreGate';

describe('fallow ignore gate reason rules', () => {
  const today = new Date(Date.UTC(2026, 0, 1));
  const cases: [string, boolean][] = [
    ['30a01fbc 2026-01-15 waiting on its first consumer', true],
    ['30a01fbc 2026-01-01 expiring today is still valid', true],
    ['30a01fbc 2026-01-31 exactly 30 days out', true],
    ['', false],
    ['landed ahead of its first consumer', false],
    ['30a01fbc waiting on its first consumer', false],
    ['2026-01-15 no node id', false],
    ['30A01FBC 2026-01-15 node id must be lowercase hex', false],
    ['30a01fb 2026-01-15 node id must be 8 hex chars', false],
    ['30a01fbc 2026-01-15', false],
    ['30a01fbc 2025-12-31 expired yesterday', false],
    ['30a01fbc 2026-02-01 more than 30 days out', false],
    ['30a01fbc 2026-02-30 not a real date', false],
  ];

  it.each(cases)('%s', (reason, accepted) => {
    expect(reasonProblem(reason, today) === null).toBe(accepted);
  });
});
