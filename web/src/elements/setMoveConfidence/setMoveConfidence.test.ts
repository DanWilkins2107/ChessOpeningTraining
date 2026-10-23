import { expect, it } from 'vitest';
import { setMoveConfidence } from './setMoveConfidence';
import { chosenTree, move, rated } from '../../tests-shared/moveNode';

it('sets the confidence in every tree holding the path, returning only those', () => {
  // Given two trees holding 1. e4 e5 alongside other moves, and one holding 1. e4 c5
  const trees = [
    chosenTree('a', [move('d4'), rated(1, 'e4', move('c5'), rated(1, 'e5'))]),
    chosenTree('b', [move('e4', rated(2, 'e5', move('Nf3')))]),
    chosenTree('c', [move('e4', move('c5'))]),
  ];

  // When 1. e4 e5 is set to 0
  const found = setMoveConfidence(trees, 'white', ['e4', 'e5'], 0);

  // Then the two trees holding it come back with only that move changed
  expect(found).toEqual([
    chosenTree('a', [move('d4'), rated(1, 'e4', move('c5'), rated(0, 'e5'))]),
    chosenTree('b', [move('e4', rated(0, 'e5', move('Nf3')))]),
  ]);
});

it('leaves the given trees unchanged', () => {
  // Given a tree
  const trees = [chosenTree('a', [move('e4')])];

  // When a confidence is set in it
  setMoveConfidence(trees, 'white', ['e4'], 3);

  // Then the original still has no confidence
  expect(trees).toEqual([chosenTree('a', [move('e4')])]);
});

it.each([
  ['white', ['e4'], 7, [rated(5, 'e4', rated(1, 'e5'))]],
  ['white', ['e4'], -1, [rated(0, 'e4', rated(1, 'e5'))]],
  ['white', ['e4', 'e5'], 4, [rated(1, 'e4', rated(2, 'e5'))]],
  ['black', ['e4'], 4, [rated(2, 'e4', rated(1, 'e5'))]],
  ['black', ['e4', 'e5'], 7, [rated(1, 'e4', rated(5, 'e5'))]],
] as const)(
  'clamps your moves to 0-5 and opponent replies to 0-2 as %s: %j set to %d',
  (side, path, confidence, expected) => {
    // Given a tree holding 1. e4 e5, both rated 1
    const trees = [chosenTree('a', [rated(1, 'e4', rated(1, 'e5'))], side)];

    // When the move is set out of range
    const found = setMoveConfidence(trees, side, [...path], confidence);

    // Then it is clamped to the range for whoever played it
    expect(found).toEqual([chosenTree('a', [...expected], side)]);
  },
);

it.each([
  ['it already has', [rated(3, 'e4')], 3],
  ['a missing confidence counts as', [move('e4')], 0],
])(
  'returns no trees when the move keeps the confidence %s',
  (_, moves, confidence) => {
    // Given a tree whose 1. e4 has that confidence
    const trees = [chosenTree('a', moves)];

    // When 1. e4 is set to it
    const found = setMoveConfidence(trees, 'white', ['e4'], confidence);

    // Then nothing needs saving
    expect(found).toEqual([]);
  },
);

it.each([
  ['the first move', ['d4']],
  ['a later move', ['e4', 'e5', 'Nf3']],
])('returns no trees when %s of the path is missing', (_, path) => {
  // Given a tree holding 1. e4 e5 only
  const trees = [chosenTree('a', [move('e4', move('e5'))])];

  // When a path it does not hold is set
  const found = setMoveConfidence(trees, 'white', path, 3);

  // Then nothing needs saving
  expect(found).toEqual([]);
});

it('leaves out the trees of the other side', () => {
  // Given a black tree holding 1. e4
  const trees = [chosenTree('a', [move('e4')], 'black')];

  // When 1. e4 is set for white
  const found = setMoveConfidence(trees, 'white', ['e4'], 3);

  // Then the black tree is not changed
  expect(found).toEqual([]);
});
