// fallow-ignore-file unused-file -- ef93ff81 2026-11-16 landed ahead of the study page, its first consumer.
import { useState } from 'react';
import { Chess } from 'chess.ts';
import type { Color, Move, PartialMove, PieceSymbol } from 'chess.ts';

type Selection = { position: string; square: string; moves: Move[] };

type Promotion = {
  position: string;
  from: string;
  to: string;
  color: Color;
  shown: string;
};

const selectionAt = (position: string, square: string) => {
  const chess = new Chess(position);
  return chess.get(square)?.color === chess.turn()
    ? { position, square, moves: chess.moves({ square, verbose: true }) }
    : null;
};

// The pawn waits on the promotion square while the piece is picked.
const pawnMoved = (
  position: string,
  from: string,
  to: string,
  color: Color,
) => {
  const chess = new Chess(position);
  chess.remove(from);
  chess.put({ type: 'p', color }, to);
  return chess.fen();
};

export function useMoveSelection(
  position: string,
  onMove?: (move: PartialMove) => void,
) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const selected = selection?.position === position ? selection : undefined;
  const promoting = promotion?.position === position ? promotion : undefined;

  const choose = (square: string) => {
    const move = selected?.moves.find((legal) => legal.to === square);
    if (move === undefined) {
      setSelection(selectionAt(position, square));
      return;
    }
    setSelection(null);
    const { from, to, color } = move;
    if (move.promotion !== undefined) {
      setPromotion({
        position,
        from,
        to,
        color,
        shown: pawnMoved(position, from, to, color),
      });
      return;
    }
    // The board only hands out choose alongside onMove.
    onMove!({ from, to });
  };

  const pickUp = (square: string) => {
    const picked = selectionAt(position, square);
    if (picked !== null) setSelection(picked);
    return picked !== null;
  };

  // The board only shows the picker while a promotion is pending.
  const promote = (piece: PieceSymbol) => {
    setPromotion(null);
    onMove!({ from: promoting!.from, to: promoting!.to, promotion: piece });
  };

  const cancelPromotion = () => setPromotion(null);

  return { selected, choose, pickUp, promoting, promote, cancelPromotion };
}
