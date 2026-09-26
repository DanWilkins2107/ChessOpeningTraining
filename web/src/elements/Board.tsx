// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import './Board.css';
import { BoardPieces } from './BoardPieces';
import { BoardSquares } from './BoardSquares';
import { FILES } from './files.constants';
import { useTrackedPieces } from './useTrackedPieces';

const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

type BoardProps = {
  position: string;
  orientation: 'white' | 'black';
  animatePieces: boolean;
};

export function Board({ position, orientation, animatePieces }: BoardProps) {
  const files = orientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'white' ? RANKS : [...RANKS].reverse();
  const pieces = useTrackedPieces(position);

  return (
    <div className="board">
      <BoardSquares files={files} ranks={ranks} pieces={pieces} />
      <BoardPieces
        files={files}
        ranks={ranks}
        pieces={pieces}
        animate={animatePieces}
      />
    </div>
  );
}
