// fallow-ignore-file unused-file -- d2b97713 2026-11-29 landed ahead of deriveExercises (74a47fb0), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { ExerciseStatus } from '../ExerciseStatus/ExerciseStatus';
import { maxConfidence } from '../maxConfidence/maxConfidence';
import type { MoveNode } from '../MoveNode/MoveNode';
import { ownConfidences } from '../ownConfidences/ownConfidences';

// Derived fresh from the confidences, so a wrong answer can drop a finished
// line back to active. Moves missing from the tree count as 0.
export const lineStatus = (
  side: ChosenMoveTree['side'],
  tree: MoveNode[],
  path: string[],
): ExerciseStatus => {
  const own = ownConfidences(side, tree, path);
  if ((own.at(-1) ?? 0) === 0) return 'unseen';
  // White's moves are the odd plies, black's the even ones.
  const ownMax = maxConfidence(side === 'white' ? 1 : 2, side);
  return own.every((confidence) => confidence === ownMax)
    ? 'finished'
    : 'active';
};
