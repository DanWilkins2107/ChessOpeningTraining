// fallow-ignore-file unused-file -- ef93ff81 2026-11-16 landed ahead of the folder page, its first consumer.
import './LoadedBoard.css';
import type { Move, PartialMove } from 'chess.ts';
import { use } from 'react';
import { BoardPieces } from '../BoardPieces/BoardPieces';
import { BoardSquares } from '../BoardSquares/BoardSquares';
import { PromotionPicker } from '../PromotionPicker/PromotionPicker';
import { FILES } from '../files/files.constants';
import { useMoveSelection } from '../useMoveSelection/useMoveSelection';
import { usePieceDrag } from '../usePieceDrag/usePieceDrag';
import { useTrackedPieces } from '../useTrackedPieces/useTrackedPieces';

const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

const hintsFor = (selection?: { square: string; moves: Move[] }) => ({
  selected: selection?.square,
  targets: selection?.moves.map((move) => move.to),
});

const axesFor = (orientation: 'white' | 'black') =>
  orientation === 'white'
    ? { files: FILES, ranks: RANKS }
    : { files: [...FILES].reverse(), ranks: [...RANKS].reverse() };

type LoadedBoardProps = {
  position: Promise<string>;
  orientation: 'white' | 'black';
  animatePieces: boolean;
  showMoveHints: boolean;
  onMove?: (move: PartialMove) => void;
};

export function LoadedBoard({
  position,
  orientation,
  animatePieces,
  showMoveHints,
  onMove,
}: LoadedBoardProps) {
  const fen = use(position);
  const { files, ranks } = axesFor(orientation);
  const { selected, choose, pickUp, promoting, promote, cancelPromotion } =
    useMoveSelection(fen, onMove);
  const pieces = useTrackedPieces(promoting?.shown ?? fen);
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
        showHints={showMoveHints}
        onSquareClick={onMove && choose}
      />
      <BoardPieces
        files={files}
        ranks={ranks}
        pieces={pieces}
        animate={animatePieces}
        dragged={dragged}
      />
      {promoting && (
        <PromotionPicker
          color={promoting.color}
          onPick={promote}
          onCancel={cancelPromotion}
        />
      )}
    </div>
  );
}
