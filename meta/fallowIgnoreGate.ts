import { FORMAT, lineProblems } from './todoGate';

const TODO_WORD = /\btodo\b/i;

export function reasonProblems(reason: string, today: Date): string[] {
  if (!TODO_WORD.test(reason)) return [`off-format, expected: ${FORMAT}`];
  return lineProblems(reason, today);
}
