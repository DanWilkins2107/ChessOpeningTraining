import { describe, expect, it, vi } from 'vitest';
import { colourLiteralsIn, strayColourLiterals } from './paletteGate';

const { execFileSync, readFileSync } = vi.hoisted(() => {
  const NUL = '\0';
  const tracked = ['src/theme.css', 'src/pages/Home/page.tsx', 'src/logo.svg'];

  return {
    execFileSync: () =>
      Buffer.from(tracked.map((file) => `${file}${NUL}`).join('')),
    readFileSync: (file: string) =>
      file.endsWith('.css')
        ? '  color: #fff;\n  border: 1px solid red;'
        : "const label = 'red';",
  };
});

vi.mock('node:child_process', () => ({
  execFileSync,
  default: { execFileSync },
}));

vi.mock('node:fs', () => ({ readFileSync, default: { readFileSync } }));

describe('palette gate colour rules', () => {
  const cases: [string, string, string[]][] = [
    ['a.css', '  color: #fff;', ['#fff']],
    ['a.css', '  background: rgb(0 0 0);', ['rgb(0 0 0)']],
    ['a.css', '  background: oklch(0.6 0.1 250);', ['oklch(0.6 0.1 250)']],
    ['a.ts', "const c = '#0a0a0a';", ['#0a0a0a']],
    ['a.css', '  color: red;', ['red']],
    ['a.css', '.red-banner {', []],
    ['a.ts', "const label = 'red';", []],
    ['a.css', '  color: var(--accent);', []],
  ];

  it.each(cases)('%s %s', (file, line, expected) => {
    expect(colourLiteralsIn(file, line)).toEqual(expected);
  });
});

describe('palette gate repo scan', () => {
  it('names the file alongside each literal it found', () => {
    expect(strayColourLiterals()).toEqual([
      'src/theme.css: #fff',
      'src/theme.css: red',
    ]);
  });
});
