import { expect, it } from 'vitest';
import {
  excludeProblems,
  moduleSources,
  placementProblems,
} from './lowestCommonFolderGate';
import type { TemporaryExclude } from './lowestCommonFolderGate';

// App-wide singletons owned by no page or element, so they sit at the src root.
const ROOT_EXCEPTIONS = [
  'src/env.ts',
  'src/main.tsx',
  'src/supabase.ts',
  'src/theme.css',
  'src/z.ts',
];

// Modules knowingly left above or below their lowest common folder, each only
// until its expiry.
const TEMPORARY_EXCLUDES: TemporaryExclude[] = [
  {
    path: 'src/shared/useAuthenticatedUser',
    expiry: '2026-11-16',
    reason:
      'useMoves is its only consumer until the other user-scoped hooks move over',
  },
];

const sources = moduleSources();

it('every module sits at the lowest common folder of its consumers', () => {
  expect(Object.keys(sources).length).toBeGreaterThan(0);
  expect(
    placementProblems(sources, [
      ...ROOT_EXCEPTIONS,
      ...TEMPORARY_EXCLUDES.map((exclude) => exclude.path),
    ]),
  ).toEqual([]);
});

it('every exclude is live, well-formed and still needed', () => {
  expect(excludeProblems(sources, ROOT_EXCEPTIONS, TEMPORARY_EXCLUDES)).toEqual(
    [],
  );
});
