import type { ReactNode } from 'react';
import './AnimatePiecesRow.css';

type AnimatePiecesRowProps = { children?: ReactNode };

export function AnimatePiecesRow({ children }: AnimatePiecesRowProps) {
  return (
    <label className="animate-pieces-row">
      Animate pieces
      {children}
    </label>
  );
}
