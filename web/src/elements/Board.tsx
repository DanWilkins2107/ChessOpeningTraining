// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import { useState } from 'react';
import './Board.css';
import { FILES } from './fen';
import { trackPieces } from './trackPieces';

const RANKS = [8, 7, 6, 5, 4, 3, 2, 1];

type BoardProps = { position: string; orientation: 'white' | 'black' };

export function Board({ position, orientation }: BoardProps) {
  const files = orientation === 'white' ? FILES : [...FILES].reverse();
  const ranks = orientation === 'white' ? RANKS : [...RANKS].reverse();
  const [shown, setShown] = useState(() => ({
    position,
    pieces: trackPieces([], position),
  }));
  const current =
    shown.position === position
      ? shown
      : { position, pieces: trackPieces(shown.pieces, position) };
  if (current !== shown) setShown(current);

  const placement = new Map(
    current.pieces.map(({ square, piece }) => [square, piece]),
  );

  return (
    <div className="board">
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
      {current.pieces.map(({ id, square, piece }) => (
        // React writes this through the CSSOM, which the style-src CSP covers
        // no more than it does a stylesheet.
        <img
          key={id}
          className="board-piece"
          src={piece.image}
          alt=""
          style={{
            transform: `translate(${files.indexOf(square[0]) * 100}%, ${ranks.indexOf(Number(square[1])) * 100}%)`,
          }}
        />
      ))}
    </div>
  );
}
