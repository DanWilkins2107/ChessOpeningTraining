import { expect, it } from 'vitest';
import { findMoveNode } from './findMoveNode';
import { move, rated } from '../../tests-shared/moveNode';

it('finds the node the path ends on', () => {
  // Given a tree with 1.e4 e5 and 1.d4
  const tree = [move('e4', rated(2, 'e5')), move('d4')];

  // When the node at 1.e4 e5 is looked up
  const node = findMoveNode(tree, ['e4', 'e5']);

  // Then it is the 1...e5 node
  expect(node).toEqual(rated(2, 'e5'));
});

it('finds nothing when the path leaves the tree', () => {
  // Given a tree with only 1.e4 e5
  const tree = [move('e4', move('e5'))];

  // When the node at 1.e4 c5 is looked up
  const node = findMoveNode(tree, ['e4', 'c5']);

  // Then there is none
  expect(node).toBeUndefined();
});
