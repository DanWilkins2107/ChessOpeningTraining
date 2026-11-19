import { expect, it } from 'vitest';
import { deriveExercises } from './deriveExercises';
import { move, rated } from '../../tests-shared/moveNode';

it('has no exercises for empty trees', () => {
  // Given empty white and black trees

  // When the exercises are derived
  const exercises = deriveExercises({ white: [], black: [] });

  // Then there are none
  expect(exercises).toEqual([]);
});

it('lists lines, splits and other-colour lines with their statuses', () => {
  // Given a white tree with a split on 1.e4, the 1...e5 line finished, and a
  // black tree where 1.d4 has a lone white move
  const trees = {
    white: [
      rated(5, 'e4', rated(2, 'e5', rated(5, 'Nf3')), move('c5', move('Nf3'))),
    ],
    black: [rated(1, 'd4', move('d5'))],
  };

  // When the exercises are derived
  const exercises = deriveExercises(trees);

  // Then each is listed once, white before black, with its own status
  expect(exercises).toEqual([
    {
      type: 'line',
      side: 'white',
      path: ['e4', 'e5', 'Nf3'],
      status: 'finished',
    },
    {
      type: 'line',
      side: 'white',
      path: ['e4', 'c5', 'Nf3'],
      status: 'unseen',
    },
    { type: 'split', side: 'white', path: ['e4'], status: 'active' },
    {
      type: 'line',
      side: 'black',
      path: ['d4', 'd5'],
      status: 'unseen',
    },
    {
      type: 'otherColour',
      side: 'black',
      path: ['d4', 'd5'],
      status: 'unseen',
    },
  ]);
});

it('derives an other-colour status from the other side tree', () => {
  // Given a white line with a lone black reply at 2, seen as black
  const trees = {
    white: [move('e4', rated(2, 'e5', move('Nf3')))],
    black: [move('e4', rated(1, 'e5', move('Nf3')))],
  };

  // When the exercises are derived
  const exercises = deriveExercises(trees);

  // Then the white tree's other-colour line is finished
  expect(exercises).toContainEqual({
    type: 'otherColour',
    side: 'white',
    path: ['e4', 'e5', 'Nf3'],
    status: 'finished',
  });
});
