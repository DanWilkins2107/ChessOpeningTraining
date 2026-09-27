// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

const ARROW_STEPS: Record<string, [row: number, column: number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

const toEdge = (index: number) => Math.min(7, Math.max(0, index));

export function useRovingFocus(firstSquare: string) {
  const grid = useRef<HTMLDivElement>(null);
  const [tabStop, setTabStop] = useState(firstSquare);

  const focusSquareAt = (row: number, column: number) => {
    const rowElement = grid.current!.children[toEdge(row)];
    (rowElement.children[toEdge(column)] as HTMLElement).focus();
  };

  const focusProps = (square: string, row: number, column: number) => ({
    tabIndex: square === tabStop ? 0 : -1,
    onFocus: () => setTabStop(square),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.currentTarget.click();
        return;
      }
      const step = ARROW_STEPS[event.key];
      if (step === undefined) return;
      event.preventDefault();
      focusSquareAt(row + step[0], column + step[1]);
    },
  });

  return { grid, focusProps };
}
