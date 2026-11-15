import { expect, it } from 'vitest';
import { enumerateOtherColour } from './enumerateOtherColour';
import { move } from '../../tests-shared/moveNode';

it('has no exercises for an empty tree', () => {
  // Given an empty tree

  // When its other-colour lines are enumerated
  const found = enumerateOtherColour('white', []);

  // Then there are none
  expect(found).toEqual([]);
});

it('keeps a white line with a lone black reply', () => {
  // Given a white tree where black's only reply is e5
  const tree = [move('e4', move('e5', move('Nf3')))];

  // When its other-colour lines are enumerated
  const found = enumerateOtherColour('white', tree);

  // Then the line is an other-colour exercise of the white tree
  expect(found).toEqual([
    { type: 'otherColour', side: 'white', path: ['e4', 'e5', 'Nf3'] },
  ]);
});

it('drops white lines whose black replies all have alternatives', () => {
  // Given a white tree where black always has two replies
  const tree = [move('e4', move('e5', move('Nf3')), move('c5', move('Nf3')))];

  // When its other-colour lines are enumerated
  const found = enumerateOtherColour('white', tree);

  // Then neither line has a reply to quiz
  expect(found).toEqual([]);
});

it('keeps a line once any reply on it has no alternative', () => {
  // Given a white tree where black's first reply branches but a later one does not
  const tree = [
    move('e4', move('e5', move('Nf3', move('Nc6'))), move('c5', move('Nf3'))),
  ];

  // When its other-colour lines are enumerated
  const found = enumerateOtherColour('white', tree);

  // Then only the line with the lone later reply is kept
  expect(found).toEqual([
    { type: 'otherColour', side: 'white', path: ['e4', 'e5', 'Nf3', 'Nc6'] },
  ]);
});

it('ignores white moves without alternatives in a white tree', () => {
  // Given a white tree with no black reply, only a lone white move
  const tree = [move('e4')];

  // When its other-colour lines are enumerated
  const found = enumerateOtherColour('white', tree);

  // Then there is nothing for black to play
  expect(found).toEqual([]);
});

it('counts a lone first move in a black tree', () => {
  // Given a black tree whose root has a single white move
  const tree = [move('e4', move('c5'), move('e5'))];

  // When its other-colour lines are enumerated
  const found = enumerateOtherColour('black', tree);

  // Then both lines quiz that first white move
  expect(found).toEqual([
    { type: 'otherColour', side: 'black', path: ['e4', 'c5'] },
    { type: 'otherColour', side: 'black', path: ['e4', 'e5'] },
  ]);
});

it('does not count a branching root in a black tree', () => {
  // Given a black tree where white has two first moves and later replies branch too
  const tree = [
    move('e4', move('c5', move('Nf3'), move('Nc3'))),
    move('d4', move('Nf6', move('c4'))),
  ];

  // When its other-colour lines are enumerated
  const found = enumerateOtherColour('black', tree);

  // Then only the line with a lone white move is kept
  expect(found).toEqual([
    { type: 'otherColour', side: 'black', path: ['d4', 'Nf6', 'c4'] },
  ]);
});

it('keeps every branch below a lone reply', () => {
  // Given a white tree where black's first reply is alone but a later one branches
  const tree = [move('e4', move('e5', move('Nf3', move('Nc6'), move('d6'))))];

  // When its other-colour lines are enumerated
  const found = enumerateOtherColour('white', tree);

  // Then both branches quiz the lone first reply
  expect(found).toEqual([
    { type: 'otherColour', side: 'white', path: ['e4', 'e5', 'Nf3', 'Nc6'] },
    { type: 'otherColour', side: 'white', path: ['e4', 'e5', 'Nf3', 'd6'] },
  ]);
});
