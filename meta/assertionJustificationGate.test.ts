import { describe, expect, it, vi } from 'vitest';
import {
  unjustifiedAssertions,
  unjustifiedCasts,
} from './assertionJustificationGate';

// mock-reason: the vi.mock factories below run while the module graph is still
// loading, before anything in this module body exists, so `repo` has to be
// built inside vi.hoisted - and static imports are not evaluated by then
// either, hence the dynamic import of the shared helper.
const repo = await vi.hoisted(async () => {
  const { fakeRepo } = await import('./tests-shared/fakeRepo');
  return fakeRepo(['src/parse.ts', 'src/sides.ts', 'src/logo.svg'], (file) =>
    file.endsWith('parse.ts')
      ? 'const x = JSON.parse(text) as Thing;'
      : "// as-reason: the literal types are the point\nconst s = ['a'] as const;",
  );
});

// mock-reason: unjustifiedAssertions scans the real repo, which is green, so
// the enumeration and formatting paths never see a violation. The stub hands it
// a three-file repo with a known answer; the rule itself is untouched.
vi.mock('node:child_process', () => repo.childProcess);

// mock-reason: the stubbed repo's files do not exist on disk, so the real
// readFileSync would throw before the rule ran.
vi.mock('node:fs', () => repo.fs);

const REASON = '// as-reason: the parser returns any';

describe('assertion justification gate rules', () => {
  const cases: [string, string, string, boolean][] = [
    ['reason above as', 'a.ts', `${REASON}\nconst x = y as T;`, true],
    ['as without a reason', 'a.ts', 'const x = y as T;', false],
    ['as const without a reason', 'a.ts', "const x = ['a'] as const;", false],
    ['angle-bracket assertion', 'a.ts', 'const x = <T>y;', false],
    ['jsx is not an assertion', 'a.tsx', 'const x = <T>y</T>;', true],
    ['satisfies is not an assertion', 'a.ts', 'const x = y satisfies T;', true],
    ['as in an export list', 'a.ts', 'export { a as b };', true],
    ['as in an import', 'a.ts', "import { a as b } from 'c';", true],
    ['as only in prose', 'a.ts', '// cast it as T\nconst x = 1;', true],
    ['as inside a string', 'a.ts', "const x = 'y as T';", true],
    ['assertion nested in a call', 'a.ts', `${REASON}\nf(g(y as T));`, true],
    [
      'reason above the line the assertion starts on',
      'a.ts',
      `${REASON}\nconst x = f(\n  y,\n) as T;`,
      true,
    ],
    ['comment without the marker', 'a.ts', '// cast\nconst x = y as T;', false],
    [
      'marker with no reason after it',
      'a.ts',
      '// as-reason:\nconst x = y as T;',
      false,
    ],
    [
      'second assertion reusing the first reason',
      'a.ts',
      `${REASON}\nconst x = y as T;\nconst z = w as T;`,
      false,
    ],
  ];

  it.each(cases)('%s', (_label, file, source, accepted) => {
    expect(unjustifiedCasts(file, source).length === 0).toBe(accepted);
  });

  it('names the line of each unjustified assertion', () => {
    expect(
      unjustifiedCasts('a.ts', `${REASON}\nf(y as T);\ng(z as T);`),
    ).toEqual([
      `3: type assertion needs "// as-reason: <why the type can't be expressed without it>" above it`,
    ]);
  });
});

describe('assertion justification gate repo scan', () => {
  it('names the file and line of the one unjustified assertion', () => {
    expect(unjustifiedAssertions()).toEqual([
      `src/parse.ts:1: type assertion needs "// as-reason: <why the type can't be expressed without it>" above it`,
    ]);
  });
});
