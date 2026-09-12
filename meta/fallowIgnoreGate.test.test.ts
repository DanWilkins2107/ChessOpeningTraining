import { describe, expect, it, vi } from 'vitest';
import { reasonProblem, rottenIgnores } from './fallowIgnoreGate';

const { execFileSync } = vi.hoisted(() => {
  const inTenDays = new Date(Date.now() + 10 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  return {
    execFileSync: () =>
      Buffer.from(
        JSON.stringify({
          files: [
            {
              path: 'src/supabase.ts',
              suppressions: [
                { line: 1, kind: 'unused-export', reason: null },
                {
                  line: 2,
                  kind: 'unused-file',
                  reason: `30a01fbc ${inTenDays} waiting on its first consumer`,
                },
                { line: 4, kind: 'unused-file', reason: 'one day, honest' },
              ],
            },
          ],
        }),
      ),
  };
});

vi.mock('node:child_process', () => ({
  execFileSync,
  default: { execFileSync },
}));

describe('fallow ignore gate reason rules', () => {
  const today = new Date(Date.UTC(2026, 0, 1));
  const cases: [string | null, boolean][] = [
    ['30a01fbc 2026-01-15 waiting on its first consumer', true],
    ['30a01fbc 2026-01-01 expiring today is still valid', true],
    ['30a01fbc 2026-01-31 exactly 30 days out', true],
    [null, false],
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

describe('fallow ignore gate repo scan', () => {
  it('reports only the unused-file ignore whose reason is off-format', () => {
    const [problem, ...rest] = rottenIgnores();

    expect(rest).toEqual([]);
    expect(problem).toContain('src/supabase.ts:4: off-format');
  });
});
