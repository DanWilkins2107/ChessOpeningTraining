// fallow-ignore-file unused-file -- 36e78342 2026-11-25 landed ahead of Daily test completion (67d41580), its first consumer.
export type QuestionOutcome = 'right' | 'wrong' | 'unanswered';

export type TestLineResult = {
  type: 'full' | 'split' | 'otherColour';
  outcomes: QuestionOutcome[];
};

type Question = { outcome: QuestionOutcome; weight: number };
type Total = { right: number; answered: number };

const LATENESS = 1.05;
const SPLIT_REPLY_WEIGHT = 2;
const OTHER_COLOUR_WEIGHT = 0.8;

// "right" means right on the first try.
export function testScore(lines: TestLineResult[]): number {
  const total = lines
    .flatMap(lineQuestions)
    .filter((question) => question.outcome !== 'unanswered')
    .reduce(addQuestion, { right: 0, answered: 0 });
  if (total.answered === 0) return 100;
  return Math.floor((100 * total.right) / total.answered);
}

const lineQuestions = (line: TestLineResult): Question[] =>
  line.outcomes.map((outcome, index) => ({
    outcome,
    weight: questionWeight(line.type, index),
  }));

function questionWeight(type: TestLineResult['type'], index: number) {
  if (type === 'split') return SPLIT_REPLY_WEIGHT;
  const lateness = LATENESS ** index;
  return type === 'otherColour' ? OTHER_COLOUR_WEIGHT * lateness : lateness;
}

const addQuestion = (total: Total, question: Question): Total => ({
  right: total.right + (question.outcome === 'right' ? question.weight : 0),
  answered: total.answered + question.weight,
});
