import { expiryProblem } from './expiry';

export const MARKER = 'TODO';

const FORMAT = `${MARKER} <8-hex AgentJira node id> <YYYY-MM-DD>: description`;

const TODO_WORD = /\btodo\b/gi;
const TODO_FORMAT = /^TODO [0-9a-f]{8} (\d{4}-\d{2}-\d{2}): \S/;

export function lineProblems(line: string, today: Date): string[] {
  return [...line.matchAll(TODO_WORD)]
    .map((match) => problemAt(line, match.index, today))
    .filter((problem): problem is string => problem !== null);
}

function problemAt(line: string, index: number, today: Date): string | null {
  const match = TODO_FORMAT.exec(line.slice(index));
  if (match === null) return `off-format, expected: ${FORMAT}`;
  return expiryProblem(match[1], today);
}
