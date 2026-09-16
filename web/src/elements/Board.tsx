// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import './Board.css';
import { FILES, readPlacement } from './fen';

const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

type BoardProps = { position: string; orientation: 'white' | 'black' };

export function Board({ position, orientation }: BoardProps) {
  const files = orientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'white' ? RANKS : [...RANKS].reverse();
  const placement = readPlacement(position);

  return (
    <div role="grid" aria-label="Chess board" className="board">
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
                {piece !== undefined && (
                  <img className="board-piece" src={piece.image} alt="" />
                )}
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
