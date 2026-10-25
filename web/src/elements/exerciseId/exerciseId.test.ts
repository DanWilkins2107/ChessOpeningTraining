import { expect, it } from 'vitest';
import type { Exercise } from '../Exercise/Exercise';
import { exerciseId } from './exerciseId';

it('joins type, side and the space-separated path', () => {
  // Given a split exercise
  const exercise: Exercise = {
    type: 'split',
    side: 'black',
    path: ['e4', 'c5'],
  };

  // When its id is built
  const id = exerciseId(exercise);

  // Then type, side and path are all in it
  expect(id).toBe('split:black:e4 c5');
});
