import { describe, expect, it } from 'vitest';
import { lineProblems } from './todoGate';

describe('todo gate line rules', () => {
  const today = new Date(Date.UTC(2026, 0, 1));
  const cases: [string, boolean][] = [
    ['// TODO 30a01fbc 2026-01-15: tidy this up', true],
    ['// TODO 30a01fbc 2026-01-01: expiring today is still valid', true],
    ['// TODO 30a01fbc 2026-01-31: exactly 30 days out', true],
    ['const label = todos.length;', true],
    ['// TODO: no node id or expiry', false],
    ['// TODO 30a01fbc: no expiry', false],
    ['// TODO 2026-01-15: no node id', false],
    ['// TODO 30A01FBC 2026-01-15: node id must be lowercase hex', false],
    ['// TODO 30a01fb 2026-01-15: node id must be 8 hex chars', false],
    ['// todo 30a01fbc 2026-01-15: keyword must be uppercase', false],
    ['// TODO 30a01fbc 2026-01-15 missing the colon', false],
    ['// TODO 30a01fbc 2026-01-15:', false],
    ['// TODO 30a01fbc 2025-12-31: expired yesterday', false],
    ['// TODO 30a01fbc 2026-02-01: more than 30 days out', false],
    ['// TODO 30a01fbc 2026-02-30: not a real date', false],
  ];

  it.each(cases)('%s', (line, accepted) => {
    expect(lineProblems(line, today).length === 0).toBe(accepted);
  });
});
