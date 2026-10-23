import { expect, it } from 'vitest';
import { maxConfidence } from './maxConfidence';

it.each([
  ['white', [5, 2, 5, 2]],
  ['black', [2, 5, 2, 5]],
] as const)(
  'allows 5 on your moves and 2 on opponent replies as %s',
  (side, expected) => {
    // Given the first four plies of a line
    const plies = [1, 2, 3, 4];

    // When each ply's maximum is found for the side
    const found = plies.map((ply) => maxConfidence(ply, side));

    // Then your moves allow 5 and the replies 2
    expect(found).toEqual(expected);
  },
);
