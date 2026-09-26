import { expect, it } from 'vitest';
import { exportNameProblems } from './exportNameGate';
import { moduleSources } from './lowestCommonFolderGate';

const sources = moduleSources();

it('names every export after its module', () => {
  expect(Object.keys(sources).length).toBeGreaterThan(0);
  expect(exportNameProblems(sources)).toEqual([]);
});
