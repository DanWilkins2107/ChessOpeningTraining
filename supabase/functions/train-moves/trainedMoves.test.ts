import { expect, it } from 'vitest';
import { move } from '../../../web/src/tests-shared/moveNode';
import { trainedMoves, userMoveCount } from './trainedMoves';

const CARO_KANN = [move('e4', move('c6', move('d4'), move('Nc3'))), move('d4')];

it('changes confidence along the path only, clamped to 0-5 for user moves and 0-2 for opponent moves', () => {
  const once = trainedMoves(CARO_KANN, 'white', ['e4', 'c6', 'd4'], [3, 5, -1]);

  expect(trainedMoves(once!, 'white', ['e4', 'c6', 'd4'], [3, -1, 2])).toEqual([
    {
      ...move('e4'),
      confidence: 5,
      children: [
        {
          ...move('c6'),
          confidence: 1,
          children: [{ ...move('d4'), confidence: 2 }, move('Nc3')],
        },
      ],
    },
    move('d4'),
  ]);
});

it('caps the odd plies at 2 in a black move tree', () => {
  const [e4] = trainedMoves(CARO_KANN, 'black', ['e4', 'c6'], [5, 5])!;

  expect([e4.confidence, e4.children[0].confidence]).toEqual([2, 5]);
});

it('returns undefined when the path is not in the moves', () => {
  expect(
    trainedMoves(CARO_KANN, 'white', ['e4', 'e5'], [1, 1]),
  ).toBeUndefined();
});

it.each([
  ['white', 2],
  ['black', 1],
] as const)('counts the %s moves on a three-ply path', (side, count) => {
  expect(userMoveCount(['e4', 'c6', 'd4'], side)).toBe(count);
});
