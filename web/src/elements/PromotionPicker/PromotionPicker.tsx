// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the folder page, its first consumer.
import './PromotionPicker.css';
import type { Color, PieceSymbol } from 'chess.ts';
import { PIECES } from '../pieces/pieces.constants';

const CHOICES: { piece: PieceSymbol; name: string }[] = [
  { piece: 'q', name: 'queen' },
  { piece: 'r', name: 'rook' },
  { piece: 'b', name: 'bishop' },
  { piece: 'n', name: 'knight' },
];

type PromotionPickerProps = {
  files: string[];
  ranks: number[];
  square: string;
  color: Color;
  onPick: (piece: PieceSymbol) => void;
  onCancel: () => void;
};

export function PromotionPicker({
  files,
  ranks,
  square,
  color,
  onPick,
  onCancel,
}: PromotionPickerProps) {
  const column = files.indexOf(square[0]);
  const row = ranks.indexOf(Number(square[1]));
  // The promotion square is on the top or bottom edge; the choices stack in
  // from it towards the middle of the board.
  const step = row === 0 ? 1 : -1;

  return (
    <div
      role="dialog"
      aria-label="Promote pawn"
      // A press on the picker is not a press on the square beneath it.
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel();
      }}
    >
      <div className="promotion-picker-backdrop" onClick={onCancel} />
      {CHOICES.map(({ piece, name }, index) => (
        <button
          key={piece}
          type="button"
          className="promotion-picker-choice"
          aria-label={`Promote to ${name}`}
          autoFocus={index === 0}
          style={{
            transform: `translate(${column * 100}%, ${(row + step * index) * 100}%)`,
          }}
          onClick={() => onPick(piece)}
        >
          <img
            src={PIECES[color === 'w' ? piece.toUpperCase() : piece].image}
            alt=""
          />
        </button>
      ))}
    </div>
  );
}
