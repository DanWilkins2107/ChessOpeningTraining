// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the folder page, its first consumer.
import './Board.css';
import { useState } from 'react';
import { Chess } from 'chess.ts';
import type { Move, PartialMove } from 'chess.ts';
import { BoardPieces } from '../BoardPieces/BoardPieces';
import { BoardSquares } from '../BoardSquares/BoardSquares';
import { FILES } from '../files/files.constants';
import { useTrackedPieces } from '../useTrackedPieces/useTrackedPieces';

const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

type Selection = { position: string; square: string; moves: Move[] };

const hintsFor = (selection?: Selection) => ({
  selected: selection?.square,
  targets: selection?.moves.map((move) => move.to),
});

type BoardProps = {
  position: string;
  orientation: 'white' | 'black';
  animatePieces: boolean;
  onMove?: (move: PartialMove) => void;
};

export function Board({
  position,
  orientation,
  animatePieces,
  onMove,
}: BoardProps) {
  const files = orientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'white' ? RANKS : [...RANKS].reverse();
  const pieces = useTrackedPieces(position);
  // Kept with the position it was made in, so a new position drops it.
  const [selection, setSelection] = useState<Selection | null>(null);
  const selected = selection?.position === position ? selection : undefined;

  const clickSquare =
    onMove &&
    ((square: string) => {
      const move = selected?.moves.find((legal) => legal.to === square);
      if (move !== undefined) {
        setSelection(null);
        // TODO b2a48478 2026-10-25: ask the Promotion picker rather than always queening.
        onMove({
          from: move.from,
          to: move.to,
          promotion: move.promotion && 'q',
        });
        return;
      }
      // Only a side-to-move piece can be selected; clicking anything else
      // deselects.
      const chess = new Chess(position);
      setSelection(
        chess.get(square)?.color === chess.turn()
          ? {
              position,
              square,
              moves: chess.moves({ square, verbose: true }),
            }
          : null,
      );
    });

  return (
    <div className="board">
      <BoardSquares
        files={files}
        ranks={ranks}
        pieces={pieces}
        {...hintsFor(selected)}
        onSquareClick={clickSquare}
      />
      <BoardPieces
        files={files}
        ranks={ranks}
        pieces={pieces}
        animate={animatePieces}
      />
    </div>
  );
}
