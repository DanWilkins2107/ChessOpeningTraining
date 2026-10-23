import { expect, it } from 'vitest';
import type { ChosenMoveTree } from '../ChosenMoveTree/ChosenMoveTree';
import { combineMoveTrees } from './combineMoveTrees';
import { chosenTree, move, rated } from '../../tests-shared/moveNode';

it('merges the trees by SAN path in the order moves are first seen', () => {
  // Given two trees sharing 1. e4 and each holding other lines
  const trees = [
    chosenTree('a', [rated(4, 'e4', rated(2, 'e5', rated(3, 'Nf3')))]),
    chosenTree('b', [rated(4, 'd4'), rated(4, 'e4', rated(1, 'c5'))]),
  ];

  // When the trees are combined
  const found = combineMoveTrees(trees).white;

  // Then each path appears once, holding every continuation
  expect(found).toEqual([
    rated(4, 'e4', rated(2, 'e5', rated(3, 'Nf3')), rated(1, 'c5')),
    rated(4, 'd4'),
  ]);
});

it('gives a shared move the lowest confidence across the trees', () => {
  // Given three trees rating 1. e4 differently, the lowest in the middle
  const trees = [
    chosenTree('a', [rated(3, 'e4')]),
    chosenTree('b', [rated(1, 'e4')]),
    chosenTree('c', [rated(4, 'e4')]),
  ];

  // When the trees are combined
  const found = combineMoveTrees(trees).white;

  // Then 1. e4 has the lowest rating
  expect(found).toEqual([rated(1, 'e4')]);
});

it('counts a move without a confidence as 0', () => {
  // Given one tree rating 1. e4 and another not
  const trees = [
    chosenTree('a', [rated(3, 'e4')]),
    chosenTree('b', [move('e4')]),
  ];

  // When the trees are combined
  const found = combineMoveTrees(trees).white;

  // Then 1. e4 has 0
  expect(found).toEqual([rated(0, 'e4')]);
});

it('splits the trees into white and black', () => {
  // Given a white tree and a black tree
  const trees = [
    chosenTree('a', [rated(3, 'e4')]),
    chosenTree('b', [rated(1, 'e4'), rated(1, 'd4')], 'black'),
  ];

  // When the trees are combined
  const found = combineMoveTrees(trees);

  // Then each side holds only its own trees' moves
  expect(found).toEqual({
    white: [rated(3, 'e4')],
    black: [rated(1, 'e4'), rated(1, 'd4')],
  });
});

it('combines no trees into no moves for either side', () => {
  // Given no chosen trees
  const trees: ChosenMoveTree[] = [];

  // When they are combined
  const found = combineMoveTrees(trees);

  // Then both sides have no moves
  expect(found).toEqual({ white: [], black: [] });
});
