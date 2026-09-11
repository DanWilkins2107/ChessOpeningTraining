const MAX_DAYS_AHEAD = 30;
const FORMAT = 'TODO <8-hex AgentJira node id> <YYYY-MM-DD>: description';
const MS_PER_DAY = 86_400_000;

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

  const [, expiryText] = match;
  const expiry = parseIsoDate(expiryText);
  if (expiry === null) return `expiry ${expiryText} is not a real date`;

  const daysAhead = (expiry.getTime() - today.getTime()) / MS_PER_DAY;
  if (daysAhead < 0) return `expiry ${expiryText} has passed`;
  if (daysAhead > MAX_DAYS_AHEAD) {
    return `expiry ${expiryText} is more than ${MAX_DAYS_AHEAD} days out`;
  }
  return null;
}

function parseIsoDate(value: string): Date | null {
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().startsWith(value) ? parsed : null;
}
