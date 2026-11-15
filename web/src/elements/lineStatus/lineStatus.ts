// fallow-ignore-file unused-file -- d2b97713 2026-11-29 landed ahead of deriveExercises (74a47fb0), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { ExerciseStatus } from '../ExerciseStatus/ExerciseStatus';
import { maxConfidence } from '../maxConfidence/maxConfidence';
import type { MoveNode } from '../MoveNode/MoveNode';

// Derived fresh from the confidences, so a wrong answer can drop a finished
// line back to active. Moves missing from the tree count as 0.
export const lineStatus = (
  side: ChosenMoveTree['side'],
  tree: MoveNode[],
  path: string[],
): ExerciseStatus => {
  // White plays the even path indexes, black the odd ones.
  const firstOwnIndex = side === 'white' ? 0 : 1;
  const own = confidences(tree, path).filter(
    (_, index) => index % 2 === firstOwnIndex,
  );
  if ((own.at(-1) ?? 0) === 0) return 'unseen';
  const ownMax = maxConfidence(firstOwnIndex + 1, side);
  return own.every((confidence) => confidence === ownMax)
    ? 'finished'
    : 'active';
};

const confidences = (tree: MoveNode[], path: string[]): number[] => {
  const found: number[] = [];
  let nodes = tree;
  for (const san of path) {
    const node = nodes.find((candidate) => candidate.san === san);
    found.push(node?.confidence ?? 0);
    nodes = node?.children ?? [];
  }
  return found;
};
