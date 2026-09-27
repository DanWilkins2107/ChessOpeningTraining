// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import { useState } from 'react';
import { Chess } from 'chess.ts';
import type { Move, PartialMove } from 'chess.ts';

type Selection = { position: string; square: string; moves: Move[] };

// Only a side-to-move piece can be selected.
const selectionAt = (position: string, square: string) => {
  const chess = new Chess(position);
  return chess.get(square)?.color === chess.turn()
    ? { position, square, moves: chess.moves({ square, verbose: true }) }
    : null;
};

const toPartialMove = (move: Move): PartialMove => ({
  from: move.from,
  to: move.to,
  // TODO b2a48478 2026-10-25: ask the Promotion picker rather than always queening.
  promotion: move.promotion && 'q',
});

export function useMoveSelection(
  position: string,
  onMove?: (move: PartialMove) => void,
) {
  // Kept with the position it was made in, so a new position drops it.
  const [selection, setSelection] = useState<Selection | null>(null);
  const selected = selection?.position === position ? selection : undefined;

  // Plays the selected piece there if it can go there; otherwise selects
  // whatever side-to-move piece is there, or nothing.
  const choose = (square: string) => {
    const move = selected?.moves.find((legal) => legal.to === square);
    if (move === undefined) {
      setSelection(selectionAt(position, square));
      return;
    }
    setSelection(null);
    // The board only hands out choose alongside onMove.
    onMove!(toPartialMove(move));
  };

  // Selects a side-to-move piece without touching the selection otherwise, so
  // a press that is not a pick-up leaves the click to decide.
  const pickUp = (square: string) => {
    const picked = selectionAt(position, square);
    if (picked !== null) setSelection(picked);
    return picked !== null;
  };

  return { selected, choose, pickUp };
}
