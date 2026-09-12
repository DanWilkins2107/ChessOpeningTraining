import { describe, expect, it, vi } from 'vitest';
import { unjustifiedCalls, unjustifiedMocks } from './mockJustificationGate';

const { execFileSync, readFileSync } = vi.hoisted(() => {
  const NUL = '\0';
  const tracked = [
    'src/pages/Home/page.test.tsx',
    'meta/mockJustificationGate.test.ts',
    'src/logo.svg',
    'meta/expiry.test.ts',
  ];

  return {
    execFileSync: () =>
      Buffer.from(tracked.map((file) => `${file}${NUL}`).join('')),
    readFileSync: (file: string) =>
      file.endsWith('page.test.tsx')
        ? "vi.spyOn(console, 'error');"
        : "// mock-reason: the clock is the input\nvi.stubEnv('TZ', 'UTC');",
  };
});

// mock-reason: unjustifiedMocks scans the real repo, which is green, so the
// enumeration and formatting paths never see a violation. The stub hands it a
// four-file repo with a known answer; the rule itself is untouched.
vi.mock('node:child_process', () => ({
  execFileSync,
  default: { execFileSync },
}));

// mock-reason: the stubbed repo's files do not exist on disk, so the real
// readFileSync would throw before the rule ran.
vi.mock('node:fs', () => ({ readFileSync, default: { readFileSync } }));

const REASON = '// mock-reason: the real one talks to the network';

describe('mock justification gate call rules', () => {
  const cases: [string, string, boolean][] = [
    ['reason above vi.mock', `${REASON}\nvi.mock('node:fs');`, true],
    ['reason above vi.doMock', `${REASON}\nvi.doMock('node:fs');`, true],
    ['reason above vi.stubEnv', `${REASON}\nvi.stubEnv('A', '1');`, true],
    [
      'reason above vi.stubGlobal',
      `${REASON}\nvi.stubGlobal('fetch', f);`,
      true,
    ],
    ['reason above vi.spyOn', `${REASON}\nvi.spyOn(console, 'error');`, true],
    ['indented reason', `  ${REASON}\n  vi.spyOn(console, 'error');`, true],
    [
      'reason wrapped onto more lines',
      `${REASON}\n// and again\nvi.mock('x');`,
      true,
    ],
    [
      'vi.hoisted is not gated',
      'const { f } = vi.hoisted(() => ({ f: 1 }));',
      true,
    ],
    ['vi.mock only mentioned in prose', '// vi.mock is discussed here', true],
    ['no comment at all', "vi.mock('node:fs');", false],
    ['comment without the marker', `// stubbed\nvi.mock('node:fs');`, false],
    ['marker with no reason after it', '// mock-reason:\nvi.mock("x");', false],
    [
      'marker below an unrelated comment',
      `// first\n${REASON}\nvi.mock('x');`,
      false,
    ],
    ['blank line between reason and call', `${REASON}\n\nvi.mock('x');`, false],
    [
      'second call reusing the first reason',
      `${REASON}\nvi.mock('a');\nvi.mock('b');`,
      false,
    ],
  ];

  it.each(cases)('%s', (_label, source, accepted) => {
    expect(unjustifiedCalls(source).length === 0).toBe(accepted);
  });
});

describe('mock justification gate repo scan', () => {
  it('names the file and line of the one unjustified call', () => {
    const [problem, ...rest] = unjustifiedMocks();

    expect(rest).toEqual([]);
    expect(problem).toContain('src/pages/Home/page.test.tsx:1: vi.spyOn');
  });
});
