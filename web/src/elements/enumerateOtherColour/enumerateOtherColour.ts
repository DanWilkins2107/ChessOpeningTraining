// fallow-ignore-file unused-file -- c9d6c32f 2026-11-29 landed ahead of deriveExercises (74a47fb0), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { Exercise } from '../Exercise/Exercise';
import type { MoveNode } from '../MoveNode/MoveNode';

// You play the opponent of the tree's side, so the opponent's moves are yours:
// odd path indexes in a white tree, even ones in a black tree. Only a move that
// is its position's sole child can be quizzed, since with siblings any of them
// would be right. A path with no quizzable move is not worth testing.
export const enumerateOtherColour = (
  side: ChosenMoveTree['side'],
  tree: MoveNode[],
): Exercise[] => {
  const opponentParity = side === 'white' ? 1 : 0;
  const found: Exercise[] = [];
  const path: string[] = [];

  const walk = (nodes: MoveNode[], quizzed: boolean) => {
    const yours = path.length % 2 === opponentParity;
    const nowQuizzed = quizzed || (yours && nodes.length === 1);
    for (const node of nodes) {
      path.push(node.san);
      if (node.children.length === 0 && nowQuizzed)
        found.push({ type: 'otherColour', side, path: [...path] });
      walk(node.children, nowQuizzed);
      path.pop();
    }
  };

  walk(tree, false);
  return found;
};
