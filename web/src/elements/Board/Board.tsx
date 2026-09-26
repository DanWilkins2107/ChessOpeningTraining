// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import './Board.css';
import { BoardPieces } from '../BoardPieces/BoardPieces';
import { BoardSquares } from '../BoardSquares/BoardSquares';
import { FILES } from '../files/files.constants';
import { useTrackedPieces } from '../useTrackedPieces/useTrackedPieces';

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
