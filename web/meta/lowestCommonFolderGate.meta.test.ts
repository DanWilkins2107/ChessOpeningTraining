import { expect, it } from 'vitest';
import {
  excludeProblems,
  moduleSources,
  placementProblems,
} from './lowestCommonFolderGate';
import type { TemporaryExclude } from './lowestCommonFolderGate';
import { ROOT_EXCEPTIONS } from './tests-shared/rootExceptions';

const rootModules = ROOT_EXCEPTIONS.map((name) => `src/${name}`);

// Modules knowingly left above or below their lowest common folder, each only
// until its expiry.
const TEMPORARY_EXCLUDES: TemporaryExclude[] = [];

const srcModules = moduleSources();

it('every module sits at the lowest common folder of its consumers', () => {
  expect(Object.keys(srcModules).length).toBeGreaterThan(0);
  expect(
    placementProblems(srcModules, [
      ...rootModules,
      ...TEMPORARY_EXCLUDES.map((exclude) => exclude.path),
    ]),
  ).toEqual([]);
});

it('every exclude is live, well-formed and still needed', () => {
  expect(excludeProblems(srcModules, rootModules, TEMPORARY_EXCLUDES)).toEqual(
    [],
  );
});
