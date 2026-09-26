import { expect, it } from 'vitest';
import { mapMoveTreeToLineArray } from './mapMoveTreeToLineArray';
import { move } from '../../tests-shared/moveNode';

it('has no lines when no moves are played', () => {
  // Given an empty tree

  // When its lines are listed
  const found = mapMoveTreeToLineArray([]);

  // Then there are none
  expect(found).toEqual([]);
});

it('has one line for a tree with no variations', () => {
  // Given a single main line
  const tree = [move('e4', move('e5', move('Nf3')))];

  // When its lines are listed
  const found = mapMoveTreeToLineArray(tree);

  // Then it is the only line
  expect(found).toEqual([['e4', 'e5', 'Nf3']]);
});

it('lists the main line first, then each variation in child order', () => {
  // Given variations at the start and part way through the main line
  const tree = [
    move('e4', move('e5', move('Nf3'), move('Bc4')), move('c5', move('Nf3'))),
    move('d4', move('d5')),
  ];

  // When its lines are listed
  const found = mapMoveTreeToLineArray(tree);

  // Then every start-to-leaf path appears, main line first
  expect(found).toEqual([
    ['e4', 'e5', 'Nf3'],
    ['e4', 'e5', 'Bc4'],
    ['e4', 'c5', 'Nf3'],
    ['d4', 'd5'],
  ]);
});
