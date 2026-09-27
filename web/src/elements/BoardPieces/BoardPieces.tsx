// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import './BoardPieces.css';
import type { PlacedPiece } from '../placedPiece/placedPiece';

type BoardPiecesProps = {
  files: string[];
  ranks: number[];
  pieces: PlacedPiece[];
  animate: boolean;
  dragged?: { square: string; x: number; y: number };
};

// One layer over the whole board rather than a child per square: a piece that
// changes square keeps its element, so the transform animates it there.
export function BoardPieces({
  files,
  ranks,
  pieces,
  animate,
  dragged,
}: BoardPiecesProps) {
  const placeOf = (square: string) =>
    square === dragged?.square
      ? `translate(calc(${dragged.x}px - 50%), calc(${dragged.y}px - 50%))`
      : `translate(${files.indexOf(square[0]) * 100}%, ${ranks.indexOf(Number(square[1])) * 100}%)`;

  return (
    <>
      {pieces.map(({ id, square, piece }) => (
        // React writes this through the CSSOM, which the style-src CSP covers
        // no more than it does a stylesheet.
        <img
          key={id}
          className={[
            'board-piece',
            !animate && 'board-piece-still',
            square === dragged?.square && 'board-piece-dragged',
          ]
            .filter(Boolean)
            .join(' ')}
          src={piece.image}
          alt=""
          style={{ transform: placeOf(square) }}
        />
      ))}
    </>
  );
}
