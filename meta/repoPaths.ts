import path from 'node:path';

export const repoRoot = path.join(import.meta.dirname, '..');

export const gateFilePrefix = (gateFile: string) =>
  path
    .relative(repoRoot, gateFile)
    .split(path.sep)
    .join('/')
    .replace(/(\.meta\.test)?\.ts$/, '');
