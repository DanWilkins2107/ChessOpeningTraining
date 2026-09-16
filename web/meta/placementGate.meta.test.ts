import { expect, it } from 'vitest';
import { isPlaced } from './placementGate';
import { ROOT_EXCEPTIONS } from './tests-shared/rootExceptions';

const modules = Object.keys(import.meta.glob('../src/**/*')).map((key) =>
  key.replace('../src/', ''),
);

it('every module sits in a page, elements or tests-shared folder', () => {
  expect(modules.length).toBeGreaterThan(0);
  expect(modules.filter((path) => !isPlaced(path, ROOT_EXCEPTIONS))).toEqual(
    [],
  );
});

it('every root exception names a file that exists', () => {
  expect(ROOT_EXCEPTIONS.filter((name) => !modules.includes(name))).toEqual([]);
});
