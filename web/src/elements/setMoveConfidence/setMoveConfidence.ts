// fallow-ignore-file unused-file -- 3c64798f 2026-11-22 landed ahead of Exercises (c42b3cac), its first consumer.
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import { maxConfidence } from '../maxConfidence/maxConfidence';
import type { MoveNode } from '../MoveNode/MoveNode';

// Returns only the trees whose moves changed, ready to save.
export function setMoveConfidence(
  trees: ChosenMoveTree[],
  side: ChosenMoveTree['side'],
  path: string[],
  confidence: number,
): ChosenMoveTree[] {
  const clamped = Math.min(
    maxConfidence(path.length, side),
    Math.max(0, confidence),
  );
  return trees
    .filter((tree) => tree.side === side)
    .flatMap((tree) => {
      const moves = withConfidence(tree.moves, path, clamped);
      return moves === tree.moves ? [] : [{ ...tree, moves }];
    });
}

// Hands back the same array when nothing changed.
function withConfidence(
  moves: MoveNode[],
  [san, ...rest]: string[],
  confidence: number,
): MoveNode[] {
  const move = moves.find((candidate) => candidate.san === san);
  if (move === undefined) return moves;

  const updated = updatedMove(move, rest, confidence);
  return updated === move
    ? moves
    : moves.map((candidate) => (candidate === move ? updated : candidate));
}

function updatedMove(
  move: MoveNode,
  rest: string[],
  confidence: number,
): MoveNode {
  if (rest.length === 0) {
    return (move.confidence ?? 0) === confidence
      ? move
      : { ...move, confidence };
  }
  const children = withConfidence(move.children, rest, confidence);
  return children === move.children ? move : { ...move, children };
}
