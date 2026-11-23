// fallow-ignore-file unused-file -- 54cd9fe5 2026-11-30 landed ahead of deriveExercises (74a47fb0), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { ExerciseStatus } from '../ExerciseStatus/ExerciseStatus';
import { lineStatus } from '../lineStatus/lineStatus';
import { maxConfidence } from '../maxConfidence/maxConfidence';
import type { MoveNode } from '../MoveNode/MoveNode';
import { quizzedConfidences } from '../quizzedConfidences/quizzedConfidences';

export const otherColourStatus = (
  side: ChosenMoveTree['side'],
  trees: Record<ChosenMoveTree['side'], MoveNode[]>,
  path: string[],
): ExerciseStatus => {
  const yourSide = side === 'white' ? 'black' : 'white';
  if (lineStatus(yourSide, trees[yourSide], path) === 'unseen') return 'unseen';
  const opponentParity = side === 'white' ? 1 : 0;
  const opponentMax = maxConfidence(opponentParity + 1, side);
  return quizzedConfidences(side, trees[side], path).every(
    (confidence) => confidence === opponentMax,
  )
    ? 'finished'
    : 'active';
};
