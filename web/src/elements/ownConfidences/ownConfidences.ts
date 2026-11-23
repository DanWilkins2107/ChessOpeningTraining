// fallow-ignore-file unused-file -- cbef563b 2026-12-21 split out of the exercise statuses, unused until the training session (aaf71c83).
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { MoveNode } from '../MoveNode/MoveNode';

// Your moves' confidences along the path. Moves missing from the tree count
// as 0.
export const ownConfidences = (
  side: ChosenMoveTree['side'],
  tree: MoveNode[],
  path: string[],
): number[] => {
  // White plays the even path indexes, black the odd ones.
  const firstOwnIndex = side === 'white' ? 0 : 1;
  return confidences(tree, path).filter(
    (_, index) => index % 2 === firstOwnIndex,
  );
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
