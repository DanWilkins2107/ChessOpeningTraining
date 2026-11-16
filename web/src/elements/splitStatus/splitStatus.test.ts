import { expect, it } from 'vitest';
import { splitStatus } from './splitStatus';
import { move, rated } from '../../tests-shared/moveNode';

it('is unseen when every line through it is unseen', () => {
  // Given a white split on 1.e4 whose replies are learned but whose lines
  // end on own moves at 0
  const tree = [
    rated(5, 'e4', rated(2, 'e5', move('Nf3')), rated(2, 'c5', move('Nf3'))),
  ];

  // When its status is derived
  const status = splitStatus('white', tree, ['e4']);

  // Then it is unseen
  expect(status).toBe('unseen');
});

it('is active once one line through it is seen and a reply is below 2', () => {
  // Given a white split on 1.e4 where only the 1...e5 line is learned
  const tree = [
    rated(
      5,
      'e4',
      rated(2, 'e5', rated(1, 'Nf3')),
      rated(1, 'c5', move('Nf3')),
    ),
  ];

  // When its status is derived
  const status = splitStatus('white', tree, ['e4']);

  // Then it is active
  expect(status).toBe('active');
});

it('is finished when a line is seen and every reply is at 2', () => {
  // Given a white split on 1.e4 with both replies at 2 and one line seen
  const tree = [
    rated(
      5,
      'e4',
      rated(2, 'e5', rated(1, 'Nf3')),
      rated(2, 'c5', move('Nf3')),
    ),
  ];

  // When its status is derived
  const status = splitStatus('white', tree, ['e4']);

  // Then it is finished, whatever the own moves are at
  expect(status).toBe('finished');
});

it('treats a reply without a confidence as 0', () => {
  // Given a white split where one reply has never been rated
  const tree = [
    rated(
      5,
      'e4',
      rated(2, 'e5', rated(5, 'Nf3')),
      move('c5', rated(5, 'Nf3')),
    ),
  ];

  // When its status is derived
  const status = splitStatus('white', tree, ['e4']);

  // Then it is active
  expect(status).toBe('active');
});

it('only counts lines through the split, not sibling lines', () => {
  // Given a white tree where 1.d4 is learned but the 1.e4 split's lines are not
  const tree = [
    rated(5, 'd4', move('d5', rated(5, 'c4'))),
    move('e4', rated(2, 'e6', move('d4')), rated(2, 'c6', move('d4'))),
  ];

  // When the 1.e4 split's status is derived
  const status = splitStatus('white', tree, ['e4']);

  // Then it is unseen
  expect(status).toBe('unseen');
});

it('reads a deeper split from its full path', () => {
  // Given a white split on 2.Nf3, with lines branching further below it
  const tree = [
    rated(
      5,
      'e4',
      move(
        'e5',
        rated(
          5,
          'Nf3',
          rated(2, 'Nc6', rated(5, 'Bb5'), move('Bc4')),
          rated(2, 'd6', move('d4')),
        ),
      ),
    ),
  ];

  // When its status is derived
  const status = splitStatus('white', tree, ['e4', 'e5', 'Nf3']);

  // Then the seen 3.Bb5 line and both replies at 2 make it finished
  expect(status).toBe('finished');
});

it('reads black splits with the opponent max for white replies', () => {
  // Given a black split on 1...Nf6 with a seen line and white replies at 2
  const tree = [
    move(
      'd4',
      rated(5, 'Nf6', rated(2, 'c4', rated(3, 'e6')), rated(2, 'Nf3')),
    ),
  ];

  // When its status is derived for black
  const status = splitStatus('black', tree, ['d4', 'Nf6']);

  // Then it is finished
  expect(status).toBe('finished');
});

it('is unseen when the split is missing from the tree', () => {
  // Given a tree without the split's path
  const tree = [rated(5, 'd4')];

  // When the status of a split on 1.e4 is derived
  const status = splitStatus('white', tree, ['e4']);

  // Then it is unseen
  expect(status).toBe('unseen');
});
