import { describe, expect, it } from 'vitest';
import { migrationNumberProblems } from './migrationNumberGate';

const folder = (...names: string[]) =>
  names.map((name) => `supabase/migrations/${name}`);

describe('migrationNumberProblems', () => {
  it('accepts migrations numbered 0001 upwards in any listed order', () => {
    expect(
      migrationNumberProblems(
        folder(
          '0002_studies.sql',
          '0001_secure_defaults.sql',
          '0003_chapters.sql',
        ),
      ),
    ).toEqual([]);
  });

  it('rejects a gap in the numbering', () => {
    expect(
      migrationNumberProblems(folder('0001_a.sql', '0002_b.sql', '0004_c.sql')),
    ).toEqual([
      'supabase/migrations/0004_c.sql: expected number 0003, with no gaps or repeats',
    ]);
  });

  it('rejects two migrations sharing a number', () => {
    expect(
      migrationNumberProblems(folder('0001_a.sql', '0002_b.sql', '0002_c.sql')),
    ).toEqual([
      'supabase/migrations/0002_c.sql: expected number 0003, with no gaps or repeats',
    ]);
  });

  it('rejects numbering that does not start at 0001', () => {
    expect(migrationNumberProblems(folder('0002_a.sql'))).toEqual([
      'supabase/migrations/0002_a.sql: expected number 0001, with no gaps or repeats',
    ]);
  });

  it('rejects off-format names without counting them in the numbering', () => {
    expect(
      migrationNumberProblems(
        folder(
          '0001_a.sql',
          '2_b.sql',
          '0002_Camel.sql',
          '0002_c.txt',
          '0002_c.sql',
        ),
      ),
    ).toEqual([
      'supabase/migrations/2_b.sql: off-format, expected: <4-digit number>_<snake_case name>.sql',
      'supabase/migrations/0002_Camel.sql: off-format, expected: <4-digit number>_<snake_case name>.sql',
      'supabase/migrations/0002_c.txt: off-format, expected: <4-digit number>_<snake_case name>.sql',
    ]);
  });
});
