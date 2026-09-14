import { expect, it } from 'vitest';
import {
  repoSources,
  singleImporterProblems,
  testImportProblems,
} from './testImportGate';

const sources = repoSources();

it('no app code imports a test or a test helper', () => {
  expect(Object.keys(sources).length).toBeGreaterThan(0);
  expect(testImportProblems(sources)).toEqual([]);
});

it('every test helper has more than one importer', () => {
  expect(singleImporterProblems(sources)).toEqual([]);
});
