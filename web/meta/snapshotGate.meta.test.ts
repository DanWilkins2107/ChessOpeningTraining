import { expect, it } from 'vitest';
import { needsSnapshot, snapshotPathFor } from './snapshotGate';

// .tsx files that render nothing, so there is no snapshot to take of them.
const NON_COMPONENTS = ['main.tsx', 'router.tsx'];

const fromSrc = (keys: string[]) =>
  keys.map((key) => key.replace('../src/', ''));

const tsxFiles = fromSrc(Object.keys(import.meta.glob('../src/**/*.tsx')));

const components = tsxFiles.filter((path) =>
  needsSnapshot(path, NON_COMPONENTS),
);

const snapshots = new Set(
  fromSrc(Object.keys(import.meta.glob('../src/**/__snapshots__/*.snap'))),
);

it('every component has a committed snapshot', () => {
  expect(components.length).toBeGreaterThan(0);
  expect(
    components
      .map(snapshotPathFor)
      .filter((snapshot) => !snapshots.has(snapshot)),
  ).toEqual([]);
});

it('every non-component names a file that exists', () => {
  expect(NON_COMPONENTS.filter((name) => !tsxFiles.includes(name))).toEqual([]);
});
