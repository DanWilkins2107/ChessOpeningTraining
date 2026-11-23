import { expect, it } from 'vitest';
import { ownConfidences } from './ownConfidences';
import { move, rated } from '../../tests-shared/moveNode';

const ruyLopez = [
  rated(3, 'e4', rated(1, 'e5', rated(4, 'Nf3', rated(2, 'Nc6')))),
];

it("reads white's moves for white", () => {
  // Given a line rated on every ply

  // When white's confidences are read
  const confidences = ownConfidences('white', ruyLopez, [
    'e4',
    'e5',
    'Nf3',
    'Nc6',
  ]);

  // Then they are 1.e4 and 2.Nf3's
  expect(confidences).toEqual([3, 4]);
});

it("reads black's moves for black", () => {
  // Given a line rated on every ply

  // When black's confidences are read
  const confidences = ownConfidences('black', ruyLopez, [
    'e4',
    'e5',
    'Nf3',
    'Nc6',
  ]);

  // Then they are 1...e5 and 2...Nc6's
  expect(confidences).toEqual([1, 2]);
});

it('counts unrated and missing moves as 0', () => {
  // Given a tree with an unrated 1.e4 and no reply

  // When white's confidences along 1.e4 e5 2.Nf3 are read
  const confidences = ownConfidences(
    'white',
    [move('e4')],
    ['e4', 'e5', 'Nf3'],
  );

  // Then both are 0
  expect(confidences).toEqual([0, 0]);
});
