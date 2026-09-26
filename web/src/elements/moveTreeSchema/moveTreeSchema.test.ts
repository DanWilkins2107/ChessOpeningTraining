import { expect, it } from 'vitest';
import { z } from '../../z';
import { moveTreeSchema } from './moveTreeSchema';
import type { MoveNode } from '../MoveNode/MoveNode';
import { leaves, move } from '../../tests-shared/moveNode';

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
