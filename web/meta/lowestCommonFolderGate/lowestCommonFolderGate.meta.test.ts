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
    path: 'src/shared/LoadBoundary',
    expiry: '2026-11-12',
    reason:
      'Account is its only consumer until the studies list (94afaf5e) and study header (692f17d4) move onto it.',
  },
  {
    path: 'src/shared/useAuthenticatedUser',
    expiry: '2026-11-16',
    reason:
      'Account is its only consumer until the load-moves hook (ed293461) and repertoire list (94afaf5e) move onto it.',
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
