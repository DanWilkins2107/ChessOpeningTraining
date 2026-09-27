// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import './BoardSquares.css';
import { FILES } from '../files/files.constants';
import type { PlacedPiece } from '../placedPiece/placedPiece';
import { useRovingFocus } from '../useRovingFocus/useRovingFocus';

type BoardSquaresProps = {
  files: string[];
  ranks: number[];
  pieces: PlacedPiece[];
  selected?: string;
  targets?: string[];
  showHints: boolean;
  onSquareClick?: (square: string) => void;
};

function hintClass(
  square: string,
  occupied: boolean,
  selected?: string,
  targets?: string[],
) {
  if (square === selected) return 'board-square-selected';
  if (!targets?.includes(square)) return undefined;
  return occupied ? 'board-square-capture' : 'board-square-target';
}

// The squares carry the position for a screen reader; the images over them are
// decoration, so this is the layer that has to name what stands where.
export function BoardSquares({
  files,
  ranks,
  pieces,
  selected,
  targets,
  showHints,
  onSquareClick,
}: BoardSquaresProps) {
  const placement = new Map(pieces.map(({ square, piece }) => [square, piece]));
  const { grid, focusProps } = useRovingFocus(`${files[0]}${ranks[0]}`);

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
                className={[
                  'board-square',
                  (FILES.indexOf(file) + rank) % 2 === 1
                    ? 'board-square-dark'
                    : 'board-square-light',
                  showHints &&
                    hintClass(square, piece !== undefined, selected, targets),
                ]
                  .filter(Boolean)
                  .join(' ')}
                {...(onSquareClick && {
                  'aria-selected': square === selected,
                  onClick: () => onSquareClick(square),
                  ...focusProps(square, row, column),
                })}
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
