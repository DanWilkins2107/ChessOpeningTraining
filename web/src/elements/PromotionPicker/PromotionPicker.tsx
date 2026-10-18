// fallow-ignore-file unused-file -- ef93ff81 2026-11-16 landed ahead of the folder page, its first consumer.
import './PromotionPicker.css';
import type { Color, PieceSymbol } from 'chess.ts';
import { PIECES } from '../../shared/pieces/pieces.constants';

const CHOICES: { piece: PieceSymbol; name: string }[] = [
  { piece: 'q', name: 'queen' },
  { piece: 'r', name: 'rook' },
  { piece: 'b', name: 'bishop' },
  { piece: 'n', name: 'knight' },
];

type PromotionPickerProps = {
  color: Color;
  onPick: (piece: PieceSymbol) => void;
  onCancel: () => void;
};

export function PromotionPicker({
  color,
  onPick,
  onCancel,
}: PromotionPickerProps) {
  return (
    <div
      role="dialog"
      aria-label="Promote pawn"
      className="promotion-picker"
      // A press on the picker is not a press on the square beneath it.
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onCancel();
      }}
    >
      <div className="promotion-picker-backdrop" onClick={onCancel} />
      <div className="promotion-picker-bar">
        {CHOICES.map(({ piece, name }, index) => (
          <button
            key={piece}
            type="button"
            className="promotion-picker-choice"
            aria-label={`Promote to ${name}`}
            autoFocus={index === 0}
            onClick={() => onPick(piece)}
          >
            <img
              src={PIECES[color === 'w' ? piece.toUpperCase() : piece].image}
              alt=""
            />
          </button>
        ))}
      </div>
    </div>
  );
}
