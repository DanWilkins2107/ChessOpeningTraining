import { expect, test } from 'vitest';

import { colourLiteralsIn } from './colourLiterals';

const THEME = 'src/theme.css';

const sources = new Map(
  Object.entries(
    import.meta.glob<string>('../src/**/*.{css,ts,tsx}', {
      query: '?raw',
      import: 'default',
      eager: true,
    }),
  ).map(([key, source]) => [key.replace('../', ''), source] as const),
);

const cssProbe = Object.values(
  import.meta.glob<string>('./fixtures/rawCssProbe.css', {
    query: '?raw',
    import: 'default',
    eager: true,
  }),
)[0];

test('colour literals live only in theme.css', () => {
  const violations = [...sources]
    .filter(([path]) => path !== THEME)
    .flatMap(([path, source]) =>
      colourLiteralsIn(path, source).map(
        (literal) => `${path} — ${literal.trim()}`,
      ),
    );

  expect(violations).toEqual([]);
});

test('the gate sees the source tree', () => {
  expect(sources.size).toBeGreaterThan(0);
});

test('css reaches the gate as raw source', () => {
  // Guards the `css: true` in vite.config.ts — without it vitest hands the gate
  // empty stylesheets and every CSS violation slips through unseen.
  expect(colourLiteralsIn('rawCssProbe.css', cssProbe)).toEqual(['#abc']);
});
