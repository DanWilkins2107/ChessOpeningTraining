import { expect, it } from 'vitest';
import { confidencePercent } from './confidencePercent';
import { chosenTree, move, rated } from '../../tests-shared/moveNode';

it('is the confidence summed over the maxima, rounded down', () => {
  // Given a white line rated 3, 1 and unrated, out of 5, 2 and 5
  const trees = [
    chosenTree('a', [rated(3, 'e4', rated(1, 'e5', move('Nf3')))]),
  ];

  // When the percent is found
  const found = confidencePercent(trees);

  // Then it is 4 out of 12
  expect(found).toBe(33);
});

it('takes the maxima from the side the tree is for', () => {
  // Given a black line rated 1, 0 and 2, out of 2, 5 and 2
  const trees = [
    chosenTree('a', [rated(1, 'e4', rated(0, 'c5', rated(2, 'Nf3')))], 'black'),
  ];

  // When the percent is found
  const found = confidencePercent(trees);

  // Then it is 3 out of 9
  expect(found).toBe(33);
});

it('weights the trees by their moves', () => {
  // Given one fully confident move and an unrated three-move line
  const trees = [
    chosenTree('a', [rated(5, 'e4')]),
    chosenTree('b', [move('d4', move('d5', move('c4')))]),
  ];

  // When the percent is found across both
  const found = confidencePercent(trees);

  // Then it is 5 out of 17, not the mean of 100 and 0
  expect(found).toBe(29);
});

it.each([
  ['no trees', []],
  ['an empty tree', [chosenTree('a', [])]],
])('is 100 for %s', (_, trees) => {
  // Given nothing to be confident in
  // When the percent is found
  const found = confidencePercent(trees);

  // Then it is full
  expect(found).toBe(100);
});
