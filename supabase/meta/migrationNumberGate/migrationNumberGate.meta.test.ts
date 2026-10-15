import { expect, it } from 'vitest';
import { migrationNumberProblems, repoMigrations } from './migrationNumberGate';

it('numbers migrations 0001 upwards with no gaps or repeats', () => {
  const migrations = repoMigrations();

  expect(migrations.length).toBeGreaterThan(0);
  expect(migrationNumberProblems(migrations)).toEqual([]);
});
