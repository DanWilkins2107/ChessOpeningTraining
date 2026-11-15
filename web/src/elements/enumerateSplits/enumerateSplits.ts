// fallow-ignore-file unused-file -- d57ac799 2026-11-29 landed ahead of deriveExercises (74a47fb0), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { Exercise } from '../Exercise/Exercise';
import type { MoveNode } from '../MoveNode/MoveNode';

// White plays the even depths, black the odd ones. A split is one of your
// moves that the opponent has 2+ replies to, so its path ends on that move.
export const enumerateSplits = (
  side: ChosenMoveTree['side'],
  tree: MoveNode[],
): Exercise[] => {
  const ownParity = side === 'white' ? 0 : 1;
  const found: Exercise[] = [];
  const path: string[] = [];

  const walk = (nodes: MoveNode[]) => {
    for (const node of nodes) {
      path.push(node.san);
      if (path.length % 2 === 1 - ownParity && node.children.length >= 2) {
        found.push({ type: 'split', side, path: [...path] });
      }
      walk(node.children);
      path.pop();
    }
  };

  walk(tree);
  return found;
};
