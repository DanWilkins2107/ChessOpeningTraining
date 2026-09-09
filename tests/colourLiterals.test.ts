import { expect, test } from 'vitest';

import { colourLiteralsIn } from './colourLiterals';

test('flags hex and colour functions', () => {
  expect(colourLiteralsIn('a.css', '  color: #fff;')).toEqual(['#fff']);
  expect(colourLiteralsIn('a.css', '  background: rgb(0 0 0);')).toEqual([
    'rgb(0 0 0)',
  ]);
  expect(colourLiteralsIn('a.ts', "const c = '#0a0a0a';")).toEqual(['#0a0a0a']);
});

test('flags named colours in css values only', () => {
  expect(colourLiteralsIn('a.css', '  color: red;')).toEqual(['red']);
  expect(colourLiteralsIn('a.css', '.red-banner {')).toEqual([]);
  expect(colourLiteralsIn('a.ts', "const label = 'red';")).toEqual([]);
});

test('leaves vars alone', () => {
  expect(colourLiteralsIn('a.css', '  color: var(--accent);')).toEqual([]);
});
