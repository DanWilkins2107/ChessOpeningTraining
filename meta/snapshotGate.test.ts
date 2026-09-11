import { expect, it } from 'vitest';
import { needsSnapshot, snapshotPathFor } from './snapshotGate';

const fromSrc = (keys: string[]) =>
  keys.map((key) => key.replace('../src/', ''));

const components = fromSrc(
  Object.keys(import.meta.glob('../src/**/*.tsx')),
).filter(needsSnapshot);

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
