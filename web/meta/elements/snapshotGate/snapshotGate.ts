export const needsSnapshot = (path: string, nonComponents: string[]) =>
  path.endsWith('.tsx') &&
  !path.endsWith('.test.tsx') &&
  !nonComponents.includes(path);

export const snapshotPathFor = (path: string) =>
  path.replace(/([^/]+)\.tsx$/, '__snapshots__/$1.snapshot.test.tsx.snap');
