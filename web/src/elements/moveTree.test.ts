import { expect, it } from 'vitest';
import { deleteMoveFromMoveTree, mapMoveTreeToLineArray } from './moveTree';
import type { MoveNode } from './moveTree';

const move = (san: string, ...children: MoveNode[]): MoveNode => ({
  san,
  children,
});

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
