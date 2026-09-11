import { SRC_EXCEPTIONS } from './srcExceptions';

export const needsSnapshot = (path: string) =>
  path.endsWith('.tsx') &&
  !path.endsWith('.test.tsx') &&
  !SRC_EXCEPTIONS.includes(path);

export const snapshotPathFor = (path: string) =>
  path.replace(/([^/]+)\.tsx$/, '__snapshots__/$1.snapshot.test.tsx.snap');
