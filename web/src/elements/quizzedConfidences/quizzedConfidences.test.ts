import { expect, it } from 'vitest';
import { quizzedConfidences } from './quizzedConfidences';
import { move, rated } from '../../tests-shared/moveNode';

it("reads the white tree's lone black replies", () => {
  // Given a white tree where 1...e5 is the lone reply and 2.Nf3 has two
  const tree = [
    rated(5, 'e4', rated(1, 'e5', move('Nf3', rated(2, 'Nc6'), move('d6')))),
  ];

  // When the quizzed confidences along 1.e4 e5 2.Nf3 Nc6 are read
  const confidences = quizzedConfidences('white', tree, [
    'e4',
    'e5',
    'Nf3',
    'Nc6',
  ]);

  // Then only 1...e5 is quizzed
  expect(confidences).toEqual([1]);
});

it("reads the black tree's lone white moves", () => {
  // Given a black tree where 1.e4 is the lone first move and 2.Nf3 unrated
  const tree = [rated(2, 'e4', rated(5, 'e5', move('Nf3')))];

  // When the quizzed confidences along 1.e4 e5 2.Nf3 are read
  const confidences = quizzedConfidences('black', tree, ['e4', 'e5', 'Nf3']);

  // Then 1.e4 and 2.Nf3 are quizzed, unrated counting as 0
  expect(confidences).toEqual([2, 0]);
});

it('counts moves missing from the tree as 0', () => {
  // Given a black tree with only 1.e4

  // When the quizzed confidences along 1.e4 e5 2.Nf3 are read
  const confidences = quizzedConfidences(
    'black',
    [rated(2, 'e4')],
    ['e4', 'e5', 'Nf3'],
  );

  // Then 2.Nf3, alone in an empty position, counts as 0
  expect(confidences).toEqual([2, 0]);
});
