import { expect, it } from 'vitest';
import { lineStatus } from './lineStatus';
import { move, rated } from '../../tests-shared/moveNode';

it('is unseen when the last own move is at 0', () => {
  // Given a white line where only the first own move has been learned
  const tree = [rated(5, 'e4', rated(2, 'e5', move('Nf3')))];

  // When its status is derived
  const status = lineStatus('white', tree, ['e4', 'e5', 'Nf3']);

  // Then it is unseen
  expect(status).toBe('unseen');
});

it('is finished when every own move is at 5', () => {
  // Given a white line with both own moves at 5 and the reply at 0
  const tree = [rated(5, 'e4', move('e5', rated(5, 'Nf3')))];

  // When its status is derived
  const status = lineStatus('white', tree, ['e4', 'e5', 'Nf3']);

  // Then it is finished, since opponent moves don't count
  expect(status).toBe('finished');
});

it('is active when the last own move is learned but another is not at 5', () => {
  // Given a white line with an earlier own move below 5
  const tree = [rated(4, 'e4', move('e5', rated(5, 'Nf3')))];

  // When its status is derived
  const status = lineStatus('white', tree, ['e4', 'e5', 'Nf3']);

  // Then it is active
  expect(status).toBe('active');
});

it('is active when the last own move is between 0 and 5', () => {
  // Given a white line whose last own move is at 1
  const tree = [rated(5, 'e4', move('e5', rated(1, 'Nf3')))];

  // When its status is derived
  const status = lineStatus('white', tree, ['e4', 'e5', 'Nf3']);

  // Then it is active
  expect(status).toBe('active');
});

it('reads black own moves from the odd path indexes', () => {
  // Given a black line where black's moves are at 5 and white's are at 0
  const tree = [move('e4', rated(5, 'c5', move('Nf3', rated(5, 'd6'))))];

  // When its status is derived for black
  const status = lineStatus('black', tree, ['e4', 'c5', 'Nf3', 'd6']);

  // Then it is finished
  expect(status).toBe('finished');
});

it('ignores a high opponent move when the last own move is at 0', () => {
  // Given a black line whose last own move is at 0 after a rated white move
  const tree = [rated(2, 'e4', rated(3, 'c5', rated(2, 'Nf3', move('d6'))))];

  // When its status is derived for black
  const status = lineStatus('black', tree, ['e4', 'c5', 'Nf3', 'd6']);

  // Then it is unseen
  expect(status).toBe('unseen');
});

it('only follows the path, not sibling moves', () => {
  // Given a white tree where a sideline is learned but the path is not
  const tree = [
    rated(5, 'e4', move('e5', move('Nf3')), move('c5', rated(5, 'Nf3'))),
  ];

  // When the main line's status is derived
  const status = lineStatus('white', tree, ['e4', 'e5', 'Nf3']);

  // Then the sideline's confidence is not used
  expect(status).toBe('unseen');
});

it('treats moves missing from the tree as 0', () => {
  // Given a tree that stops before the path does
  const tree = [rated(5, 'e4')];

  // When the status of a longer path is derived
  const status = lineStatus('white', tree, ['e4', 'e5', 'Nf3']);

  // Then the missing own move makes it unseen
  expect(status).toBe('unseen');
});

it('is unseen when the path has no own move', () => {
  // Given a black path that is only white's first move
  const tree = [rated(2, 'e4')];

  // When its status is derived for black
  const status = lineStatus('black', tree, ['e4']);

  // Then it is unseen
  expect(status).toBe('unseen');
});
