// fallow-ignore-file unused-file -- 54cd9fe5 2026-11-30 landed ahead of deriveExercises (74a47fb0), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { ExerciseStatus } from '../ExerciseStatus/ExerciseStatus';
import { lineStatus } from '../lineStatus/lineStatus';
import { maxConfidence } from '../maxConfidence/maxConfidence';
import type { MoveNode } from '../MoveNode/MoveNode';

// You play the opponent of the tree's side, so the line stays unseen until you
// have seen it in your own tree. The quizzed replies are the opponent moves
// that are their position's only child, as in enumerateOtherColour. Moves
// missing from a tree count as 0.
export const otherColourStatus = (
  side: ChosenMoveTree['side'],
  trees: Record<ChosenMoveTree['side'], MoveNode[]>,
  path: string[],
): ExerciseStatus => {
  const yourSide = side === 'white' ? 'black' : 'white';
  if (lineStatus(yourSide, trees[yourSide], path) === 'unseen') return 'unseen';
  const opponentParity = side === 'white' ? 1 : 0;
  const opponentMax = maxConfidence(opponentParity + 1, side);
  return quizzedConfidences(trees[side], path, opponentParity).every(
    (confidence) => confidence === opponentMax,
  )
    ? 'finished'
    : 'active';
};

const quizzedConfidences = (
  tree: MoveNode[],
  path: string[],
  opponentParity: number,
): number[] =>
  positionsAlong(tree, path).flatMap((nodes, index) =>
    index % 2 === opponentParity && isOnlyChild(nodes, path[index])
      ? [find(nodes, path[index])?.confidence ?? 0]
      : [],
  );

// The moves on offer at each step of the path, empty once it leaves the tree.
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

// A missing move with no siblings still counts, at 0.
const isOnlyChild = (nodes: MoveNode[], san: string) =>
  nodes.every((candidate) => candidate.san === san);
