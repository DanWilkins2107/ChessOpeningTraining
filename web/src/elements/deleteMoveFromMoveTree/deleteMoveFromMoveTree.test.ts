import { expect, it } from 'vitest';
import { deleteMoveFromMoveTree } from './deleteMoveFromMoveTree';
import { move } from '../../tests-shared/moveNode';

it('deletes a move and everything after it', () => {
  // Given a variation part way through a first move that has a sibling
  const tree = [
    move('e4', move('e5', move('Nf3')), move('c5', move('Nf3'))),
    move('d4', move('d5')),
  ];

  // When a move in that first move's continuation is deleted
  const found = deleteMoveFromMoveTree(tree, ['e4', 'e5']);

  // Then only that move and what follows it are gone
  expect(found).toEqual([
    move('e4', move('c5', move('Nf3'))),
    move('d4', move('d5')),
  ]);
});

it('deletes a first move, keeping the other first moves', () => {
  // Given two first moves
  const tree = [move('e4', move('e5')), move('d4', move('d5'))];

  // When one first move is deleted
  const found = deleteMoveFromMoveTree(tree, ['e4']);

  // Then the other stays
  expect(found).toEqual([move('d4', move('d5'))]);
});

it('leaves the given tree unchanged when deleting', () => {
  // Given a tree
  const tree = [move('e4', move('e5'))];

  // When a move is deleted from it
  deleteMoveFromMoveTree(tree, ['e4', 'e5']);

  // Then the original still has the move
  expect(tree).toEqual([move('e4', move('e5'))]);
});

it('throws when deleting a move that is not in the tree', () => {
  // Given a tree with two first moves
  const tree = [move('e4', move('e5')), move('d4')];

  // When a move that was never played is deleted
  const deleting = () => deleteMoveFromMoveTree(tree, ['e4', 'c5']);

  // Then it throws naming the move
  expect(deleting).toThrow('No move c5 in the tree');
});
