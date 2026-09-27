// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import './BoardPieces.css';
import type { PlacedPiece } from '../placedPiece/placedPiece';

type BoardPiecesProps = {
  files: string[];
  ranks: number[];
  pieces: PlacedPiece[];
  animate: boolean;
};

// One layer over the whole board rather than a child per square: a piece that
// changes square keeps its element, so the transform animates it there.
export function BoardPieces({
  files,
  ranks,
  pieces,
  animate,
}: BoardPiecesProps) {
  return (
    <>
      {pieces.map(({ id, square, piece }) => (
        // React writes this through the CSSOM, which the style-src CSP covers
        // no more than it does a stylesheet.
        <img
          key={id}
          className={animate ? 'board-piece' : 'board-piece board-piece-still'}
          src={piece.image}
          alt=""
          style={{
            transform: `translate(${files.indexOf(square[0]) * 100}%, ${ranks.indexOf(Number(square[1])) * 100}%)`,
          }}
        />
      ))}
    </>
  );
}
