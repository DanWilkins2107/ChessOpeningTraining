// fallow-ignore-file unused-file -- cbef563b 2026-12-21 split out of the exercise statuses, unused until the training session (aaf71c83).
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { MoveNode } from '../MoveNode/MoveNode';

// Playing the other colour, only the side's moves with no alternative are
// quizzed. Moves missing from the tree count as 0.
export const quizzedConfidences = (
  side: ChosenMoveTree['side'],
  tree: MoveNode[],
  path: string[],
): number[] => {
  const opponentParity = side === 'white' ? 1 : 0;
  return positionsAlong(tree, path).flatMap((nodes, index) =>
    index % 2 === opponentParity && isOnlyChild(nodes, path[index])
      ? [find(nodes, path[index])?.confidence ?? 0]
      : [],
  );
};
const positionsAlong = (tree: MoveNode[], path: string[]): MoveNode[][] => {
  const positions: MoveNode[][] = [];
  let nodes = tree;
  for (const san of path) {
    positions.push(nodes);
    nodes = find(nodes, san)?.children ?? [];
  }
  return positions;
};

const find = (nodes: MoveNode[], san: string) =>
  nodes.find((candidate) => candidate.san === san);

const isOnlyChild = (nodes: MoveNode[], san: string) =>
  nodes.every((candidate) => candidate.san === san);
