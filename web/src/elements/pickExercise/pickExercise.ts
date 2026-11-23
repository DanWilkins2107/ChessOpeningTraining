// fallow-ignore-file unused-file -- cbef563b 2026-12-21 landed ahead of the training session (aaf71c83), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { Exercise } from '../Exercise/Exercise';
import type { MoveNode } from '../MoveNode/MoveNode';
import { weighExercises } from '../weighExercises/weighExercises';

// The old app's weighted pick. recent: the last two picks, oldest first.
// Undefined when there's nothing to train. random is injectable for tests.
export const pickExercise = (
  trees: Record<ChosenMoveTree['side'], MoveNode[]>,
  recent: Exercise[],
  random: () => number = Math.random,
): Exercise | undefined => {
  const candidates = weighExercises(trees, recent, random);
  let roll =
    random() * candidates.reduce((total, { weight }) => total + weight, 0);
  return candidates.find(({ weight }) => (roll -= weight) < 0)?.exercise;
};
