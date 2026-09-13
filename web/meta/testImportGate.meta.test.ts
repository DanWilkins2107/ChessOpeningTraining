import { expect, it } from 'vitest';
import { moduleSources } from './lowestCommonFolderGate';
import { testImportProblems } from './testImportGate';

const sources = moduleSources();

it('no app code imports a test or a test helper', () => {
  expect(Object.keys(sources).length).toBeGreaterThan(0);
  expect(testImportProblems(sources)).toEqual([]);
});
