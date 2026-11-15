import { expect, it } from 'vitest';
import { enumerateLines } from './enumerateLines';
import { move } from '../../tests-shared/moveNode';

it('has no lines for an empty tree', () => {
  // Given an empty tree

  // When its lines are enumerated
  const found = enumerateLines('white', []);

  // Then there are none
  expect(found).toEqual([]);
});

it('makes a line exercise for every root-to-leaf path, in tree order', () => {
  // Given a white tree with sidelines
  const tree = [move('e4', move('e5', move('Nf3')), move('c5', move('Nf3')))];

  // When its lines are enumerated
  const found = enumerateLines('white', tree);

  // Then each path is a white line, main line first
  expect(found).toEqual([
    { type: 'line', side: 'white', path: ['e4', 'e5', 'Nf3'] },
    { type: 'line', side: 'white', path: ['e4', 'c5', 'Nf3'] },
  ]);
});

it('keeps a white line that is only the first move', () => {
  // Given a white tree that is just 1.e4
  const tree = [move('e4')];

  // When its lines are enumerated
  const found = enumerateLines('white', tree);

  // Then 1.e4 is a line, since white played it
  expect(found).toEqual([{ type: 'line', side: 'white', path: ['e4'] }]);
});

it('drops black paths with no black move', () => {
  // Given a black tree where one branch stops after white's first move
  const tree = [move('e4'), move('d4', move('Nf6'))];

  // When its lines are enumerated
  const found = enumerateLines('black', tree);

  // Then only the path black played in is a line
  expect(found).toEqual([{ type: 'line', side: 'black', path: ['d4', 'Nf6'] }]);
});
