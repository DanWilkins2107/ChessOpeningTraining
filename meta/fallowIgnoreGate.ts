import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { z } from '../web/src/z';
import { expiryProblem, startOfTodayUtc } from './expiry';

const suppressionSchema = z.object({
  line: z.number(),
  kind: z.string(),
  reason: z.string().nullable(),
});

type Suppression = z.infer<typeof suppressionSchema>;

const inventorySchema = z.object({
  files: z.array(
    z.object({ path: z.string(), suppressions: z.array(suppressionSchema) }),
  ),
});

const FORMAT =
  'fallow-ignore-file unused-file -- <8-hex AgentJira node id> <YYYY-MM-DD> description';

const REASON_FORMAT = /^[0-9a-f]{8} (\d{4}-\d{2}-\d{2}) \S/;

const repoRoot = path.join(import.meta.dirname, '..');
const fallowBin = createRequire(import.meta.url).resolve('fallow/bin/fallow');

export function reasonProblem(
  reason: string | null,
  today: Date,
): string | null {
  const match = REASON_FORMAT.exec(reason ?? '');
  if (match === null) return `off-format, expected: ${FORMAT}`;
  return expiryProblem(match[1], today);
}

export function rottenIgnores(): string[] {
  const today = startOfTodayUtc();
  return inventory().files.flatMap((file) =>
    file.suppressions.flatMap((suppression) =>
      suppressionProblems(file.path, suppression, today),
    ),
  );
}

function suppressionProblems(
  file: string,
  suppression: Suppression,
  today: Date,
): string[] {
  if (suppression.kind !== 'unused-file') return [];

  const problem = reasonProblem(suppression.reason, today);
  return problem === null ? [] : [`${file}:${suppression.line}: ${problem}`];
}

function inventory() {
  const output = execFileSync(
    process.execPath,
    [fallowBin, 'suppressions', '--format', 'json'],
    { cwd: repoRoot },
  ).toString('utf8');
  return inventorySchema.parse(JSON.parse(output));
}
