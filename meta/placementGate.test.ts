import { expect, it } from 'vitest';
import { isPlaced } from './placementGate';
import { SRC_EXCEPTIONS } from './srcExceptions';

const modules = Object.keys(import.meta.glob('../src/**/*')).map((key) =>
  key.replace('../src/', ''),
);

it('every module sits in a page folder or an elements folder', () => {
  expect(modules.length).toBeGreaterThan(0);
  expect(modules.filter((path) => !isPlaced(path))).toEqual([]);
});

it('every exception names a file that exists', () => {
  expect(SRC_EXCEPTIONS.filter((name) => !modules.includes(name))).toEqual([]);
});
