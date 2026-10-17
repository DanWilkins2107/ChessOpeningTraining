import { useMoves } from '../useMoves/useMoves';

// TODO dbda0c80 2026-11-15: draw the board from these moves.
export function MoveTreeMoves({ moveTreeId }: { moveTreeId: string }) {
  useMoves(moveTreeId);
  return null;
}
