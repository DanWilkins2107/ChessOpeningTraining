// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import { useState } from 'react';
import './Board.css';
import { BoardPieces } from './BoardPieces';
import { BoardSquares } from './BoardSquares';
import { FILES } from './fen';
import { trackPieces } from './trackPieces';
import type { PlacedPiece } from './trackPieces';

const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

type BoardProps = { position: string; orientation: 'white' | 'black' };

export function Board({ position, orientation }: BoardProps) {
  const files = orientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'white' ? RANKS : [...RANKS].reverse();
  const pieces = useTrackedPieces(position);

  return (
    <div className="board">
      <BoardSquares files={files} ranks={ranks} pieces={pieces} />
      <BoardPieces files={files} ranks={ranks} pieces={pieces} />
    </div>
  );
}

// Ids come from the previous placement, so the Board has to remember where the
// pieces were rather than only the position it was last handed.
function useTrackedPieces(position: string): PlacedPiece[] {
  const [shown, setShown] = useState(() => ({
    position,
    pieces: trackPieces([], position),
  }));
  const current =
    shown.position === position
      ? shown
      : { position, pieces: trackPieces(shown.pieces, position) };
  if (current !== shown) setShown(current);

  return current.pieces;
}
