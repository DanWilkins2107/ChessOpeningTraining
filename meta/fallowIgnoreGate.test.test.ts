import { describe, expect, it } from 'vitest';
import { reasonProblems } from './fallowIgnoreGate';

describe('fallow ignore gate reason rules', () => {
  const today = new Date(Date.UTC(2026, 0, 1));
  const cases: [string, boolean][] = [
    ['TODO 30a01fbc 2026-01-15: waiting on its first consumer', true],
    ['TODO 30a01fbc 2026-01-31: exactly 30 days out', true],
    ['landed ahead of its first consumer', false],
    ['TODO: no node id or expiry', false],
    ['TODO 30a01fbc: no expiry', false],
    ['TODO 30a01fbc 2025-12-31: expired yesterday', false],
    ['TODO 30a01fbc 2026-02-01: more than 30 days out', false],
  ];

  it.each(cases)('%s', (reason, accepted) => {
    expect(reasonProblems(reason, today).length === 0).toBe(accepted);
  });
});
