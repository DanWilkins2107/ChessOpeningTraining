// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import './Board.css';
import type { Move, PartialMove } from 'chess.ts';
import { BoardPieces } from '../BoardPieces/BoardPieces';
import { BoardSquares } from '../BoardSquares/BoardSquares';
import { FILES } from '../files/files.constants';
import { useMoveSelection } from '../useMoveSelection/useMoveSelection';
import { usePieceDrag } from '../usePieceDrag/usePieceDrag';
import { useTrackedPieces } from '../useTrackedPieces/useTrackedPieces';

const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const hintsFor = (selection?: { square: string; moves: Move[] }) => ({
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
  const { selected, choose, pickUp } = useMoveSelection(position, onMove);
  // A drop is a click on the square it lands on.
  const { dragged, pointerProps } = usePieceDrag({
    files,
    ranks,
    pickUp,
    drop: choose,
  });

  return (
    <div
      className="board"
      {...(onMove && {
        className: 'board board-interactive',
        ...pointerProps,
      })}
    >
      <BoardSquares
        files={files}
        ranks={ranks}
        pieces={pieces}
        {...hintsFor(selected)}
        onSquareClick={onMove && choose}
      />
      <BoardPieces
        files={files}
        ranks={ranks}
        pieces={pieces}
        animate={animatePieces}
        dragged={dragged}
      />
    </div>
  );
}
