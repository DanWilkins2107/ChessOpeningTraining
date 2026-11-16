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
): number[] => {
  const found: number[] = [];
  let nodes = tree;
  path.forEach((san, index) => {
    const node = nodes.find((candidate) => candidate.san === san);
    const onlyChild = nodes.every((candidate) => candidate.san === san);
    if (index % 2 === opponentParity && onlyChild)
      found.push(node?.confidence ?? 0);
    nodes = node?.children ?? [];
  });
  return found;
};
