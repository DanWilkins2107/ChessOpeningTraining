import { expect, it } from 'vitest';
import { readPlacement } from './fen';

const START_PLACEMENT = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

const nameOn = (fen: string, square: string) =>
  readPlacement(fen).get(square)?.name;

it('puts the first row of the placement on rank 8', () => {
  // Given the starting placement

  // When it is read
  // Then its leading row landed on rank 8
  expect(nameOn(START_PLACEMENT, 'a8')).toBe('black rook');
});

it('puts the last row of the placement on rank 1', () => {
  // Given the starting placement

  // When it is read
  // Then its trailing row landed on rank 1
  expect(nameOn(START_PLACEMENT, 'e1')).toBe('white king');
});

it('leaves a square no piece stands on empty', () => {
  // Given the starting placement

  // When it is read
  // Then the middle of the board holds nothing
  expect(nameOn(START_PLACEMENT, 'e4')).toBeUndefined();
});

it('counts the files a digit skips before the piece after it', () => {
  // Given a row where four empty files precede a pawn

  // When it is read
  // Then the pawn stands on the fifth file
  expect(nameOn('8/8/8/8/4P3/8/8/8', 'e4')).toBe('white pawn');
});

it('reads the placement out of a full FEN', () => {
  // Given a FEN carrying side to move, castling, en passant and the clocks

  // When it is read
  // Then only the placement field was used
  expect(nameOn(`${START_PLACEMENT} w KQkq - 0 1`, 'e1')).toBe('white king');
});
