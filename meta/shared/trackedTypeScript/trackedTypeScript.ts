import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../repoPaths/repoPaths';

const TYPESCRIPT = /\.tsx?$/;

export function trackedTypeScript(): string[] {
  return execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot })
    .toString('utf8')
    .split('\0')
    .filter((file) => TYPESCRIPT.test(file));
}

export function problemsIn(
  files: string[],
  rule: (file: string, text: string) => string[],
): string[] {
  return files.flatMap((file) =>
    rule(file, readFileSync(path.join(repoRoot, file), 'utf8')).map(
      (problem) => `${file}:${problem}`,
    ),
  );
}
