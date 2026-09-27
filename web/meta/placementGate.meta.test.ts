import { expect, it } from 'vitest';
import { isPlaced, routesWithoutPage } from './placementGate';

// App-wide singletons owned by no page or element, so they sit at the src root.
const ROOT_EXCEPTIONS = [
  'env.ts',
  'main.tsx',
  'supabase.ts',
  'theme.css',
  'z.ts',
];

const modules = Object.keys(import.meta.glob('../src/**/*')).map((key) =>
  key.replace('../src/', ''),
);

it('every module sits in a page, module or tests-shared folder', () => {
  expect(modules.length).toBeGreaterThan(0);
  expect(modules.filter((path) => !isPlaced(path, ROOT_EXCEPTIONS))).toEqual(
    [],
  );
});

it('every route folder but a group has a page.tsx', () => {
  expect(routesWithoutPage(modules)).toEqual([]);
});

it('every root exception names a file that exists', () => {
  expect(ROOT_EXCEPTIONS.filter((name) => !modules.includes(name))).toEqual([]);
});
