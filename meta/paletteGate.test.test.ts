import { describe, expect, it } from 'vitest';
import { colourLiteralsIn } from './paletteGate';

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
