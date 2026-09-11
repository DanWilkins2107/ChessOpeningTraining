import { expiryProblem } from './expiry';

const FORMAT =
  'fallow-ignore-file unused-file -- <8-hex AgentJira node id> <YYYY-MM-DD> description';

const REASON_FORMAT = /^[0-9a-f]{8} (\d{4}-\d{2}-\d{2}) \S/;

export function reasonProblem(
  reason: string | null,
  today: Date,
): string | null {
  const match = REASON_FORMAT.exec(reason ?? '');
  if (match === null) return `off-format, expected: ${FORMAT}`;
  return expiryProblem(match[1], today);
}
