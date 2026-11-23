// fallow-ignore-file unused-file -- 93363d1c 2026-11-30 landed ahead of deriveExercises (74a47fb0), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { ExerciseStatus } from '../ExerciseStatus/ExerciseStatus';
import { findMoveNode } from '../findMoveNode/findMoveNode';
import { lineStatus } from '../lineStatus/lineStatus';
import { mapMovesToLineArray } from '../mapMovesToLineArray/mapMovesToLineArray';
import { maxConfidence } from '../maxConfidence/maxConfidence';
import type { MoveNode } from '../MoveNode/MoveNode';
import { replyConfidences } from '../replyConfidences/replyConfidences';

// The path ends on your move; the split quizzes the opponent's replies to it.
// Unseen until a line through it is seen, so a split isn't tested before its
// lines. Moves missing from the tree count as 0.
export const splitStatus = (
  side: ChosenMoveTree['side'],
  tree: MoveNode[],
  path: string[],
): ExerciseStatus => {
  const node = findMoveNode(tree, path);
  if (node === undefined) return 'unseen';
  const lines = mapMovesToLineArray([node]).map((line) => [
    ...path.slice(0, -1),
    ...line,
  ]);
  if (lines.every((line) => lineStatus(side, tree, line) === 'unseen')) {
    return 'unseen';
  }
  const replyMax = maxConfidence(path.length + 1, side);
  return replyConfidences(tree, path).every(
    (confidence) => confidence === replyMax,
  )
    ? 'finished'
    : 'active';
};
