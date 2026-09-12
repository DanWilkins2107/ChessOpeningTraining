import { expect, it } from 'vitest';
import { isPlaced } from './placementGate';

// App-wide singletons owned by no page or element, so they sit at the src root.
const ROOT_EXCEPTIONS = [
  'env.ts',
  'main.tsx',
  'router.tsx',
  'supabase.ts',
  'theme.css',
];

const modules = Object.keys(import.meta.glob('../src/**/*')).map((key) =>
  key.replace('../src/', ''),
);

it('every module sits in a page folder or an elements folder', () => {
  expect(modules.length).toBeGreaterThan(0);
  expect(modules.filter((path) => !isPlaced(path, ROOT_EXCEPTIONS))).toEqual(
    [],
  );
});

it('every root exception names a file that exists', () => {
  expect(ROOT_EXCEPTIONS.filter((name) => !modules.includes(name))).toEqual([]);
});
