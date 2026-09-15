import { expect, it } from 'vitest';
import { move } from '../tests-shared/move';
import { playMove } from './playMove';

it('plays the first move into an empty tree', () => {
  // Given an empty tree

  // When e4 is played from the start
  const played = playMove([], [], 'e4');

  // Then the tree and line hold e4
  expect(played).toEqual({ tree: [move('e4')], line: ['e4'] });
});

it('adds a new move after the existing children as a variation', () => {
  // Given 1. e4 e5 with a 1. d4 variation
  const tree = [move('e4', move('e5')), move('d4')];

  // When c5 is played after e4
  const played = playMove(tree, ['e4'], 'c5');

  // Then c5 follows e5 under e4, and d4 is untouched
  expect(played).toEqual({
    tree: [move('e4', move('e5'), move('c5')), move('d4')],
    line: ['e4', 'c5'],
  });
});

it('follows an existing move instead of adding it again', () => {
  // Given 1. e4 with e5 and c5 replies
  const tree = [move('e4', move('e5'), move('c5'))];

  // When c5 is played after e4
  const played = playMove(tree, ['e4'], 'c5');

  // Then the tree is unchanged and the line moves to c5
  expect(played).toEqual({ tree, line: ['e4', 'c5'] });
});

it('stores a move given as squares in SAN', () => {
  // Given an empty tree

  // When the g1 knight is moved to f3
  const played = playMove([], [], { from: 'g1', to: 'f3' });

  // Then it is stored as Nf3
  expect(played).toEqual({ tree: [move('Nf3')], line: ['Nf3'] });
});

it('rejects an illegal move', () => {
  // Given 1. e4 already played
  const tree = [move('e4')];

  // When white tries to move again
  const played = playMove(tree, ['e4'], 'd4');

  // Then nothing is played
  expect(played).toBeNull();
});

it('throws when the line it plays from is illegal', () => {
  // Given a line where white moves twice

  // When a move is played from it
  const play = () => playMove([], ['e4', 'd4'], 'e5');

  // Then the illegal move is reported
  expect(play).toThrow('d4 is illegal in line e4 d4');
});
