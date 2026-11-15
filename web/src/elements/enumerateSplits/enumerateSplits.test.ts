import { expect, it } from 'vitest';
import { enumerateSplits } from './enumerateSplits';
import { move } from '../../tests-shared/moveNode';

it('has no splits for an empty tree', () => {
  // Given an empty tree

  // When its splits are enumerated
  const found = enumerateSplits('white', []);

  // Then there are none
  expect(found).toEqual([]);
});

it('has no split where an own move has only one reply', () => {
  // Given a white tree with a single reply to each white move
  const tree = [move('e4', move('e5', move('Nf3', move('Nc6'))))];

  // When its splits are enumerated
  const found = enumerateSplits('white', tree);

  // Then there are none
  expect(found).toEqual([]);
});

it('makes a split ending on each white move with 2+ replies, in tree order', () => {
  // Given a white tree branching after 1.e4 and after 2.Nf3
  const tree = [
    move('e4', move('e5', move('Nf3', move('Nc6'), move('d6'))), move('c5')),
  ];

  // When its splits are enumerated
  const found = enumerateSplits('white', tree);

  // Then 1.e4 comes before 2.Nf3
  expect(found).toEqual([
    { type: 'split', side: 'white', path: ['e4'] },
    { type: 'split', side: 'white', path: ['e4', 'e5', 'Nf3'] },
  ]);
});

it('ignores opponent moves with 2+ replies', () => {
  // Given a white tree where black's 1...e5 has two white replies
  const tree = [move('e4', move('e5', move('Nf3'), move('Bc4')))];

  // When its splits are enumerated
  const found = enumerateSplits('white', tree);

  // Then those are white's own alternatives, not a split
  expect(found).toEqual([]);
});

it('makes splits on black moves in a black tree', () => {
  // Given a black tree where 1...Nf6 meets two white replies, and white's
  // first moves are the opponent's
  const tree = [move('d4', move('Nf6', move('c4'), move('Nf3'))), move('e4')];

  // When its splits are enumerated
  const found = enumerateSplits('black', tree);

  // Then 1...Nf6 is the only split
  expect(found).toEqual([
    { type: 'split', side: 'black', path: ['d4', 'Nf6'] },
  ]);
});
