// fallow-ignore-file unused-file -- ef93ff81 2026-11-16 landed ahead of the study page, its first consumer.
import { useRef, useState } from 'react';
import type { PointerEvent } from 'react';

// Far enough that a click which wobbles is still a click.
const DRAG_THRESHOLD_PX = 4;

type Point = { x: number; y: number };

type Grip = { square: string; start: Point; lifted: boolean };

type PieceDragOptions = {
  files: string[];
  ranks: number[];
  pickUp: (square: string) => boolean;
  drop: (square: string) => void;
};

export function usePieceDrag({ files, ranks, pickUp, drop }: PieceDragOptions) {
  const grip = useRef<Grip | null>(null);
  // Only lifting and landing re-render; the pointer's position goes straight
  // to the board's --drag-x/--drag-y, which BoardPieces places the piece by.
  const [dragged, setDragged] = useState<string>();

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

  const letGo = () => {
    grip.current = null;
    setDragged(undefined);
  };

  const pointerProps = {
    onPointerDown: (event: PointerEvent<HTMLElement>) => {
      const square = squareAt(event);
      if (pickUp(square)) {
        grip.current = { square, start: onBoard(event).point, lifted: false };
      }
    },
    onPointerMove: (event: PointerEvent<HTMLElement>) => {
      const held = grip.current;
      if (held === null) return;
      const { point } = onBoard(event);
      if (!held.lifted) {
        const moved = Math.hypot(
          point.x - held.start.x,
          point.y - held.start.y,
        );
        if (moved < DRAG_THRESHOLD_PX) return;
        // Once dragging, the release belongs to the board wherever it lands,
        // and no click follows on the square underneath.
        event.currentTarget.setPointerCapture(event.pointerId);
        held.lifted = true;
        setDragged(held.square);
      }
      event.currentTarget.style.setProperty('--drag-x', `${point.x}px`);
      event.currentTarget.style.setProperty('--drag-y', `${point.y}px`);
    },
    onPointerUp: (event: PointerEvent<HTMLElement>) => {
      const lifted = grip.current?.lifted;
      letGo();
      if (lifted) drop(squareAt(event));
    },
    // The piece goes home still selected, since the user never let go.
    onPointerCancel: letGo,
  };

  return { dragged, pointerProps };
}
