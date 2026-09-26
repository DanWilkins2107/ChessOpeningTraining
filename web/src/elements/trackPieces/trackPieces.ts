// fallow-ignore-file unused-file -- ef93ff81 2026-10-15 landed ahead of the study page, its first consumer.
import type { PlacedPiece } from '../placedPiece/placedPiece';
import type { Piece } from '../pieces/pieces.constants';
import { readPlacement } from '../readPlacement/readPlacement';

export function trackPieces(
  previous: PlacedPiece[],
  position: string,
): PlacedPiece[] {
  const arriving = readPlacement(position);

  const stayed = previous.filter(
    (placed) => arriving.get(placed.square)?.name === placed.piece.name,
  );
  const settled = new Set(stayed.map((placed) => placed.square));
  const freed = previous.filter((placed) => !settled.has(placed.square));
  const taken = new Set(previous.map((placed) => placed.id));

  const arrived = [...arriving]
    .filter(([square]) => !settled.has(square))
    .map(([square, piece]) => ({
      id: adoptId(freed, taken, piece),
      square,
      piece,
    }));

  // Ascending id keeps the render order fixed, so a slide in flight is never
  // interrupted by React moving the image to a new place in the DOM.
  return [...stayed, ...arrived].sort((left, right) => left.id - right.id);
}

function adoptId(
  freed: PlacedPiece[],
  taken: Set<number>,
  piece: Piece,
): number {
  const index = freed.findIndex((placed) => placed.piece.name === piece.name);
  const id = index === -1 ? unusedId(taken) : freed.splice(index, 1)[0].id;
  taken.add(id);
  return id;
}

function unusedId(taken: Set<number>): number {
  let id = 0;
  while (taken.has(id)) id += 1;
  return id;
}
