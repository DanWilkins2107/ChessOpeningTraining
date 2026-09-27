// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import { useState } from 'react';
import type { PointerEvent } from 'react';

// Far enough that a click which wobbles is still a click.
const DRAG_THRESHOLD_PX = 4;

type Point = { x: number; y: number };

type Grip = { square: string; start: Point; at?: Point };

type PieceDragOptions = {
  files: string[];
  ranks: number[];
  pickUp: (square: string) => boolean;
  drop: (square: string) => void;
};

export function usePieceDrag({ files, ranks, pickUp, drop }: PieceDragOptions) {
  const [grip, setGrip] = useState<Grip | null>(null);

  const onBoard = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    return {
      point,
      column: Math.floor((point.x / rect.width) * 8),
      row: Math.floor((point.y / rect.height) * 8),
    };
  };

  // Off the board this names no real square, so it holds nothing to move to
  // or select.
  const squareAt = (event: PointerEvent<HTMLElement>) => {
    const { column, row } = onBoard(event);
    return `${files[column]}${ranks[row]}`;
  };

  const pointerProps = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      const square = squareAt(event);
      if (pickUp(square)) {
        setGrip({ square, start: onBoard(event).point });
      }
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      if (grip === null) return;
      const { point } = onBoard(event);
      const moved = Math.hypot(point.x - grip.start.x, point.y - grip.start.y);
      if (!grip.at && moved < DRAG_THRESHOLD_PX) return;
      // Once dragging, the release belongs to the board wherever it lands,
      // and no click follows on the square underneath.
      event.currentTarget.setPointerCapture(event.pointerId);
      setGrip({ ...grip, at: point });
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      setGrip(null);
      if (grip?.at) drop(squareAt(event));
    },
    // The piece goes home still selected, since the user never let go.
    onPointerCancel: () => setGrip(null),
  };

  const dragged = grip?.at && { square: grip.square, ...grip.at };

  return { dragged, pointerProps };
}
