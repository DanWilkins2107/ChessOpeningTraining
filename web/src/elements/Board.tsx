// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import './Board.css';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

type BoardProps = { orientation: 'white' | 'black' };

export function Board({ orientation }: BoardProps) {
  const files = orientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'white' ? RANKS : [...RANKS].reverse();

  return (
    <div role="grid" aria-label="Chess board" className="board">
      {ranks.map((rank, row) => (
        <div role="row" key={rank} className="board-row">
          {files.map((file, column) => (
            <div
              role="gridcell"
              key={file}
              aria-label={`${file}${rank}`}
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
          ))}
        </div>
      ))}
    </div>
  );
}
