import { execFileSync } from 'node:child_process';
import path from 'node:path';

const MIGRATIONS_FOLDER = 'supabase/migrations';
const FORMAT = '<4-digit number>_<snake_case name>.sql';
const MIGRATION_NAME = /^(\d{4})_[a-z0-9_]+\.sql$/;

const repoRoot = path.join(import.meta.dirname, '..');

export function repoMigrations(): string[] {
  return execFileSync('git', ['ls-files', '-z', MIGRATIONS_FOLDER], {
    cwd: repoRoot,
  })
    .toString('utf8')
    .split('\0')
    .filter((file) => file !== '');
}

export function migrationNumberProblems(files: string[]): string[] {
  const offFormat = files
    .filter((file) => numberOf(file) === null)
    .map((file) => `${file}: off-format, expected: ${FORMAT}`);

  const misnumbered = files
    .filter((file) => numberOf(file) !== null)
    .toSorted()
    .flatMap((file, index) => {
      const expected = String(index + 1).padStart(4, '0');
      return numberOf(file) === expected
        ? []
        : [`${file}: expected number ${expected}, with no gaps or repeats`];
    });

  return [...offFormat, ...misnumbered];
}

function numberOf(file: string): string | null {
  return MIGRATION_NAME.exec(path.posix.basename(file))?.[1] ?? null;
}
