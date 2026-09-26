import { expect, it } from 'vitest';
import { z } from '../z';
import {
  deleteMoveFromMoveTree,
  mapMoveTreeToLineArray,
  moveTreeSchema,
} from './moveTree';
import type { MoveNode } from './moveTree';
import { leaves, move } from '../tests-shared/moveNode';

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

const line = (plies: number) =>
  Array.from({ length: plies }).reduce<MoveNode[]>(
    (children) => [move('e4', ...children)],
    [],
  );

// The empty tree is not first: zod reads the recursive children schema once, on
// the first parse, and Stryker only credits that first test with covering it.
it.each([
  ['a tree with variations', [move('e4', move('c6', move('d4'), move('Nc3')))]],
  ['a 600-ply line', line(600)],
  ['1000 lines at one ply', leaves(1000)],
  [
    '1000 lines ending at different plies',
    [...leaves(600), move('d4', ...leaves(400))],
  ],
  ['an empty tree', []],
])('loads a stored move tree with %s', (_, stored) => {
  // Given a stored tree the database accepts

  // When it is loaded
  const loaded = moveTreeSchema.parse(stored);

  // Then it comes back unchanged
  expect(loaded).toEqual(stored);
});

it.each([
  ['a tree that is not an array', {}],
  ['a move that is not an object', ['e4']],
  ['a null move', [null]],
  ['a move without a san', [{ children: [] }]],
  ['a move whose san is not a string', [{ san: 4, children: [] }]],
  ['a move without children', [{ san: 'e4' }]],
  ['a move whose children are not an array', [{ san: 'e4', children: {} }]],
  ['a move with an extra key', [{ ...move('e4'), comment: 'Best by test' }]],
  [
    'an invalid move deep in a variation',
    [move('e4', move('c6', { san: 'd4' } as MoveNode))],
  ],
])('refuses to load a stored move tree with %s', (_, stored) => {
  // Given a stored tree with the wrong shape

  // When it is loaded, then the load fails
  expect(() => moveTreeSchema.parse(stored)).toThrow(z.ZodError);
});

it.each([
  ['a 601-ply line', line(601), 'A move tree line can be at most 600 plies'],
  [
    '1001 lines at one ply',
    leaves(1001),
    'A move tree can have at most 1000 lines',
  ],
  [
    '1001 lines ending at different plies',
    [...leaves(600), move('d4', ...leaves(401))],
    'A move tree can have at most 1000 lines',
  ],
])('refuses to load a stored move tree with %s', (_, stored, message) => {
  // Given a stored tree over a cap

  // When it is loaded, then the load fails naming the cap
  expect(() => moveTreeSchema.parse(stored)).toThrow(message);
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
