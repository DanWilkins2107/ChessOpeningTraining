const MAX_DAYS_AHEAD = 30;
const MS_PER_DAY = 86_400_000;

export function startOfTodayUtc(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
}

export function expiryProblem(expiryText: string, today: Date): string | null {
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
