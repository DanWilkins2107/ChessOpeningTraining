import { expect, it } from 'vitest';
import { otherColourStatus } from './otherColourStatus';
import { move, rated } from '../../tests-shared/moveNode';

const path = ['e4', 'e5', 'Nf3'];
const seenAsBlack = [move('e4', rated(1, 'e5', move('Nf3')))];

it('is unseen when the line has not been seen as your own colour', () => {
  // Given a white line with its reply at 2 but black's tree unlearned
  const trees = {
    white: [move('e4', rated(2, 'e5', move('Nf3')))],
    black: [move('e4', move('e5', move('Nf3')))],
  };

  // When its other-colour status is derived
  const status = otherColourStatus('white', trees, path);

  // Then it is unseen
  expect(status).toBe('unseen');
});

it('is unseen when the line is missing from your own tree', () => {
  // Given a white line with its reply at 2 and an empty black tree
  const trees = {
    white: [move('e4', rated(2, 'e5', move('Nf3')))],
    black: [],
  };

  // When its other-colour status is derived
  const status = otherColourStatus('white', trees, path);

  // Then it is unseen
  expect(status).toBe('unseen');
});

it('is finished when every quizzed reply is at 2', () => {
  // Given a white line seen as black, with its lone reply at 2
  const trees = {
    white: [move('e4', rated(2, 'e5', move('Nf3')))],
    black: seenAsBlack,
  };

  // When its other-colour status is derived
  const status = otherColourStatus('white', trees, path);

  // Then it is finished
  expect(status).toBe('finished');
});

it('is active when a quizzed reply is below 2', () => {
  // Given a white line seen as black, with its lone reply at 1
  const trees = {
    white: [move('e4', rated(1, 'e5', move('Nf3')))],
    black: seenAsBlack,
  };

  // When its other-colour status is derived
  const status = otherColourStatus('white', trees, path);

  // Then it is active
  expect(status).toBe('active');
});

it('ignores replies that have siblings', () => {
  // Given a white line whose first reply has a sibling and is at 0
  const fullPath = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'];
  const trees = {
    white: [
      move(
        'e4',
        move('e5', move('Nf3', rated(2, 'Nc6', move('Bb5')))),
        move('c5'),
      ),
    ],
    black: [move('e4', move('e5', move('Nf3', rated(1, 'Nc6', move('Bb5')))))],
  };

  // When its other-colour status is derived
  const status = otherColourStatus('white', trees, fullPath);

  // Then only the lone reply counts, so it is finished
  expect(status).toBe('finished');
});

it('reads a black tree’s quizzed replies from the even path indexes', () => {
  // Given a black line seen as white, with white's lone moves at 2
  const blackPath = ['e4', 'c5', 'Nf3'];
  const trees = {
    white: [rated(1, 'e4', move('c5', rated(1, 'Nf3')))],
    black: [rated(2, 'e4', rated(5, 'c5', rated(1, 'Nf3')))],
  };

  // When its other-colour status is derived for the black tree
  const status = otherColourStatus('black', trees, blackPath);

  // Then a quizzed move below 2 keeps it active
  expect(status).toBe('active');
});

it('is finished for a black tree once white’s lone moves are at 2', () => {
  // Given a black line seen as white, with both white moves at 2
  const blackPath = ['e4', 'c5', 'Nf3'];
  const trees = {
    white: [rated(1, 'e4', move('c5', rated(1, 'Nf3')))],
    black: [rated(2, 'e4', move('c5', rated(2, 'Nf3')))],
  };

  // When its other-colour status is derived for the black tree
  const status = otherColourStatus('black', trees, blackPath);

  // Then it is finished, since black's own moves don't count
  expect(status).toBe('finished');
});

it('treats a missing lone reply as 0', () => {
  // Given a white tree that stops before the path's reply
  const trees = { white: [move('e4')], black: seenAsBlack };

  // When its other-colour status is derived
  const status = otherColourStatus('white', trees, path);

  // Then the missing reply keeps it active
  expect(status).toBe('active');
});
