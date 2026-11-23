// fallow-ignore-file unused-file -- cbef563b 2026-12-21 landed ahead of the training session (aaf71c83), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import { confidencePercent } from '../confidencePercent/confidencePercent';
import { deriveExercises } from '../deriveExercises/deriveExercises';
import type { Exercise } from '../Exercise/Exercise';
import type { MoveNode } from '../MoveNode/MoveNode';
import { ownConfidences } from '../ownConfidences/ownConfidences';
import { quizzedConfidences } from '../quizzedConfidences/quizzedConfidences';
import { replyConfidences } from '../replyConfidences/replyConfidences';

type Trees = Record<ChosenMoveTree['side'], MoveNode[]>;
type Derived = ReturnType<typeof deriveExercises>[number];
type Candidate = { exercise: Derived; weight: number };
type PickedType = Exclude<Exercise['type'], 'ownSplit'>;

// The old app's weights, indexed by the exercise's lowest quizzed confidence,
// so shakier exercises come up more.
const LEVEL_WEIGHTS: Record<PickedType, number[]> = {
  line: [4, 2, 1, 0.5, 0.5],
  split: [2, 1],
  otherColour: [2, 1],
};

// New lines join until the active exercises' weights add up to this.
const MIN_WORK = 15;

// The exercises that could come up next, each with its chance as a weight.
// recent: the last two picks, oldest first. random picks the new lines.
export const weighExercises = (
  trees: Trees,
  recent: Exercise[],
  random: () => number,
): Candidate[] => {
  const exercises = deriveExercises(trees);
  const active = exercises
    .filter((exercise) => exercise.status === 'active')
    .map((exercise) => ({ exercise, weight: levelWeight(trees, exercise) }));
  const unseenLines = exercises.filter(
    (exercise) => exercise.type === 'line' && exercise.status === 'unseen',
  );
  const candidates = [
    ...active,
    ...newLines(unseenLines, sum(active.map(({ weight }) => weight)), random),
  ];
  if (candidates.length === 0) return revision(exercises, recent);

  const percent = confidencePercent([
    { side: 'white', moves: trees.white },
    { side: 'black', moves: trees.black },
  ]);
  return candidates.map(({ exercise, weight }) => ({
    exercise,
    weight:
      weight *
      recencyWeight(exercise, recent) *
      confidenceWeight(exercise, percent) *
      Math.sqrt(unfinished(exercises, exercise.type)),
  }));
};

// Once everything is finished, any of it comes up evenly bar the recent ones.
const revision = (exercises: Derived[], recent: Exercise[]): Candidate[] =>
  exercises
    .filter((exercise) => exercise.status === 'finished')
    .map((exercise) => ({
      exercise,
      weight: recencyWeight(exercise, recent),
    }));

// Unseen lines join at the lowest level, at random, until there's enough work.
const newLines = (
  unseen: Derived[],
  activeWeight: number,
  random: () => number,
): Candidate[] => {
  const pool = [...unseen];
  const added: Candidate[] = [];
  let total = activeWeight;
  while (total < MIN_WORK && pool.length > 0) {
    const [exercise] = pool.splice(Math.floor(random() * pool.length), 1);
    added.push({ exercise, weight: LEVEL_WEIGHTS.line[0] });
    total += LEVEL_WEIGHTS.line[0];
  }
  return added;
};

const levelWeight = (trees: Trees, exercise: Exercise): number =>
  // as-reason: deriveExercises never yields ownSplit, but Exercise allows it.
  LEVEL_WEIGHTS[exercise.type as PickedType][
    Math.min(...quizzed(trees, exercise))
  ];

const quizzed = (trees: Trees, { type, side, path }: Exercise): number[] => {
  if (type === 'line') return ownConfidences(side, trees[side], path);
  if (type === 'split') return replyConfidences(trees[side], path);
  return quizzedConfidences(side, trees[side], path);
};

const unfinished = (exercises: Derived[], type: Exercise['type']) =>
  exercises.filter(
    (exercise) => exercise.type === type && exercise.status !== 'finished',
  ).length;

// Last pick x0.01 and the one before x0.1, plus a smaller nudge away from the
// type of either.
const recencyWeight = (exercise: Exercise, recent: Exercise[]): number =>
  holdBack(exercise, recent.at(-1), 0.01, 0.6) *
  holdBack(exercise, recent.at(-2), 0.1, 0.8);

const holdBack = (
  exercise: Exercise,
  pick: Exercise | undefined,
  sameWeight: number,
  sameTypeWeight: number,
): number =>
  (isSame(exercise, pick) ? sameWeight : 1) *
  (exercise.type === pick?.type ? sameTypeWeight : 1);

// Up to 20% more lines while confidence is low, and more splits and
// other-colour lines as it grows.
const confidenceWeight = ({ type }: Exercise, percent: number): number =>
  1 + ((type === 'line' ? 100 - percent : percent) / 100) * 0.2;

const isSame = (a: Exercise, b: Exercise | undefined) =>
  b !== undefined && key(a) === key(b);

const key = ({ type, side, path }: Exercise) =>
  JSON.stringify([type, side, path]);

const sum = (values: number[]) =>
  values.reduce((total, value) => total + value, 0);
