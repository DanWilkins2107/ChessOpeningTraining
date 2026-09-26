// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import './BoardSquares.css';
import { useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { FILES } from '../files/files.constants';
import type { PlacedPiece } from '../placedPiece/placedPiece';

type BoardSquaresProps = {
  files: string[];
  ranks: number[];
  pieces: PlacedPiece[];
  selected?: string | null;
  onSquareClick?: (square: string) => void;
};

const ARROW_STEPS: Record<string, [row: number, column: number]> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

const toEdge = (index: number) => Math.min(7, Math.max(0, index));

// The squares carry the position for a screen reader; the images over them are
// decoration, so this is the layer that has to name what stands where.
export function BoardSquares({
  files,
  ranks,
  pieces,
  selected,
  onSquareClick,
}: BoardSquaresProps) {
  const placement = new Map(pieces.map(({ square, piece }) => [square, piece]));
  const grid = useRef<HTMLDivElement>(null);
  // The one square Tab lands on; arrow keys move focus from there.
  const [tabStop, setTabStop] = useState(`${files[0]}${ranks[0]}`);

  const interaction =
    onSquareClick &&
    ((square: string, row: number, column: number) => ({
      'aria-selected': square === selected,
      tabIndex: square === tabStop ? 0 : -1,
      onClick: () => onSquareClick(square),
      onFocus: () => setTabStop(square),
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSquareClick(square);
          return;
        }
        const step = ARROW_STEPS[event.key];
        if (step === undefined) return;
        event.preventDefault();
        const next = grid.current!.children[toEdge(row + step[0])].children[
          toEdge(column + step[1])
        ] as HTMLElement;
        next.focus();
      },
    }));

  return (
    <div ref={grid} role="grid" aria-label="Chess board" className="board-grid">
      {ranks.map((rank, row) => (
        <div role="row" key={rank} className="board-row">
          {files.map((file, column) => {
            const square = `${file}${rank}`;
            const piece = placement.get(square);
            return (
              <div
                role="gridcell"
                key={file}
                aria-label={
                  piece === undefined ? square : `${square}, ${piece.name}`
                }
                className={
                  (FILES.indexOf(file) + rank) % 2 === 1
                    ? 'board-square board-square-dark'
                    : 'board-square board-square-light'
                }
                {...interaction?.(square, row, column)}
              >
                {column === 0 && (
                  <span aria-hidden className="board-rank">
                    {rank}
                  </span>
                )}
                {row === 7 && (
                  <span aria-hidden className="board-file">
                    {file}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
