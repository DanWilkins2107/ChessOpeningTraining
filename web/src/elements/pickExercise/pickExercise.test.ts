import { expect, it } from 'vitest';
import { pickExercise } from './pickExercise';
import { move, rated } from '../../tests-shared/moveNode';
import { always } from '../../tests-shared/roll';

it('has nothing to pick from empty trees', () => {
  // Given empty white and black trees

  // When an exercise is picked
  const picked = pickExercise({ white: [], black: [] }, []);

  // Then there is none
  expect(picked).toBeUndefined();
});

const twoFinishedLines = {
  white: [
    rated(5, 'e4', move('e5', rated(5, 'Nf3'))),
    rated(5, 'd4', move('d5', rated(5, 'c4'))),
  ],
  black: [],
};

it('draws the first exercise for a roll inside its weight', () => {
  // Given two finished lines of equal weight

  // When an exercise is picked with a roll of a quarter
  const picked = pickExercise(twoFinishedLines, [], always(0.25));

  // Then the first line is picked
  expect(picked).toEqual({
    type: 'line',
    side: 'white',
    path: ['e4', 'e5', 'Nf3'],
    status: 'finished',
  });
});

it('draws the next exercise for a roll on the boundary', () => {
  // Given two finished lines of equal weight

  // When an exercise is picked with a roll of a half
  const picked = pickExercise(twoFinishedLines, [], always(0.5));

  // Then the second line is picked
  expect(picked).toEqual({
    type: 'line',
    side: 'white',
    path: ['d4', 'd5', 'c4'],
    status: 'finished',
  });
});
