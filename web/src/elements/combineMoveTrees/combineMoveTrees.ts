// fallow-ignore-file unused-file -- 3c64798f 2026-11-22 landed ahead of Exercises (c42b3cac), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import type { MoveNode } from '../MoveNode/MoveNode';

export const combineMoveTrees = (
  trees: ChosenMoveTree[],
): Record<ChosenMoveTree['side'], MoveNode[]> => ({
  white: combineSide(trees, 'white'),
  black: combineSide(trees, 'black'),
});

const combineSide = (
  trees: ChosenMoveTree[],
  side: ChosenMoveTree['side'],
): MoveNode[] =>
  combineMoves(
    trees.filter((tree) => tree.side === side).map((tree) => tree.moves),
  );

function combineMoves(movesList: MoveNode[][]): MoveNode[] {
  const sans = new Set(movesList.flat().map((move) => move.san));
  return [...sans].map((san) => {
    const holding = movesList.flatMap((moves) =>
      moves.filter((move) => move.san === san),
    );
    return {
      san,
      confidence: Math.min(...holding.map((move) => move.confidence ?? 0)),
      children: combineMoves(holding.map((move) => move.children)),
    };
  });
}
