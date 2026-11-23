import { expect, it } from 'vitest';
import { replyConfidences } from './replyConfidences';
import { move, rated } from '../../tests-shared/moveNode';

it('reads every reply to the move', () => {
  // Given 1.e4 with replies rated 2 and unrated

  // When the replies to 1.e4 are read
  const confidences = replyConfidences(
    [move('e4', rated(2, 'e5'), move('c5'))],
    ['e4'],
  );

  // Then the unrated reply counts as 0
  expect(confidences).toEqual([2, 0]);
});

it('has none when the move is missing from the tree', () => {
  // Given a tree without 1.e4

  // When the replies to 1.e4 are read
  const confidences = replyConfidences(
    [rated(5, 'd4', rated(1, 'd5'))],
    ['e4'],
  );

  // Then there are none
  expect(confidences).toEqual([]);
});
