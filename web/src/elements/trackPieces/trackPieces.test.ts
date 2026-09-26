import { expect, it } from 'vitest';
import { ROOK_ON_H5, ROOKS_HOME } from '../../tests-shared/rookPositions';
import { trackPieces } from './trackPieces';
import type { PlacedPiece } from './trackPieces';

const PAWN_E2 = '4k3/8/8/8/8/8/4P3/4K3';
const PAWN_E3 = '4k3/8/8/8/8/4P3/8/4K3';
const PAWN_ON_A7 = '4k3/P7/8/8/8/8/8/4K3';
const QUEEN_ON_A8 = 'Q3k3/8/8/8/8/8/8/4K3';
const PAWN_MEETS_PAWN = '4k3/8/8/8/8/3p4/4P3/4K3';
const PAWN_TOOK_PAWN = '4k3/8/8/8/8/3P4/8/4K3';

const idAt = (pieces: PlacedPiece[], square: string) =>
  pieces.find((placed) => placed.square === square)?.id;

const idsOf = (pieces: PlacedPiece[]) => pieces.map((placed) => placed.id);

it('places every piece the position names', () => {
  // Given no pieces are on the board yet

  // When a position arrives
  const pieces = trackPieces([], PAWN_E2);

  // Then each of its pieces has a square
  expect(pieces.map((placed) => placed.square)).toEqual(['e8', 'e2', 'e1']);
});

it('gives the pieces of a first position ids of their own', () => {
  // Given no pieces are on the board yet

  // When a position arrives
  const pieces = trackPieces([], PAWN_E2);

  // Then no two of them share an id
  expect(idsOf(pieces)).toEqual([0, 1, 2]);
});

it('keeps the id of a piece that has not moved', () => {
  // Given a position on the board
  const before = trackPieces([], PAWN_E2);

  // When another piece moves
  const after = trackPieces(before, PAWN_E3);

  // Then the piece that stayed is still the same one
  expect(idAt(after, 'e8')).toBe(idAt(before, 'e8'));
});

it('carries the id of a moving piece to its new square', () => {
  // Given a position on the board
  const before = trackPieces([], PAWN_E2);

  // When the pawn steps forward
  const after = trackPieces(before, PAWN_E3);

  // Then e3 holds the piece that stood on e2
  expect(idAt(after, 'e3')).toBe(idAt(before, 'e2'));
});

it('orders pieces by id so a move never reshuffles them', () => {
  // Given a position on the board
  const before = trackPieces([], PAWN_E2);

  // When the pawn steps forward
  const after = trackPieces(before, PAWN_E3);

  // Then the ids come back in the order they were handed out
  expect(idsOf(after)).toEqual([0, 1, 2]);
});

it('leaves a piece of the same kind that did not move alone', () => {
  // Given both white rooks are at home
  const before = trackPieces([], ROOKS_HOME);

  // When the h1 rook moves up the board
  const after = trackPieces(before, ROOK_ON_H5);

  // Then the a1 rook is still the piece it was
  expect(idAt(after, 'a1')).toBe(idAt(before, 'a1'));
});

it('matches a move to the piece of that kind that actually left', () => {
  // Given both white rooks are at home
  const before = trackPieces([], ROOKS_HOME);

  // When the h1 rook moves up the board
  const after = trackPieces(before, ROOK_ON_H5);

  // Then h5 holds the rook that stood on h1
  expect(idAt(after, 'h5')).toBe(idAt(before, 'h1'));
});

it('slides a capturing piece onto the square it took', () => {
  // Given a black pawn stands on d3
  const before = trackPieces([], PAWN_MEETS_PAWN);

  // When the e2 pawn takes it
  const after = trackPieces(before, PAWN_TOOK_PAWN);

  // Then d3 holds the piece that stood on e2
  expect(idAt(after, 'd3')).toBe(idAt(before, 'e2'));
});

it('takes a captured piece off the board', () => {
  // Given a black pawn stands on d3
  const before = trackPieces([], PAWN_MEETS_PAWN);

  // When the e2 pawn takes it
  const after = trackPieces(before, PAWN_TOOK_PAWN);

  // Then one fewer piece is left
  expect(after).toHaveLength(before.length - 1);
});

it('gives a piece that no departure explains an unused id', () => {
  // Given a white pawn stands on a7
  const before = trackPieces([], PAWN_ON_A7);

  // When it promotes to a queen
  const after = trackPieces(before, QUEEN_ON_A8);

  // Then the queen is a new piece rather than the pawn renamed
  expect(idsOf(after)).toEqual([0, 2, 3]);
});
