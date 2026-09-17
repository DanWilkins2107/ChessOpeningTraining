// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import './BoardSquares.css';
import { FILES } from './fen';
import type { PlacedPiece } from './trackPieces';

type BoardSquaresProps = {
  files: string[];
  ranks: number[];
  pieces: PlacedPiece[];
};

// The squares carry the position for a screen reader; the images over them are
// decoration, so this is the layer that has to name what stands where.
export function BoardSquares({ files, ranks, pieces }: BoardSquaresProps) {
  const placement = new Map(pieces.map(({ square, piece }) => [square, piece]));

  return (
    <div role="grid" aria-label="Chess board" className="board-grid">
      {ranks.map((rank, row) => (
        <div role="row" key={rank} className="board-row">
          {files.map((file, column) => {
            const piece = placement.get(`${file}${rank}`);
            return (
              <div
                role="gridcell"
                key={file}
                aria-label={
                  piece === undefined
                    ? `${file}${rank}`
                    : `${file}${rank}, ${piece.name}`
                }
                className={
                  (FILES.indexOf(file) + rank) % 2 === 1
                    ? 'board-square board-square-dark'
                    : 'board-square board-square-light'
                }
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
