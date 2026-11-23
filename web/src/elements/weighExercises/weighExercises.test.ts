import { expect, it } from 'vitest';
import { weighExercises } from './weighExercises';
import type { Exercise } from '../Exercise/Exercise';
import { move, rated } from '../../tests-shared/moveNode';
import { always } from '../../tests-shared/roll';

const whiteLine = (...path: string[]): Exercise => ({
  type: 'line',
  side: 'white',
  path,
});

const learningLines = {
  white: [
    rated(1, 'e4', move('e5', rated(3, 'Nf3'))),
    rated(3, 'd4', move('d5', rated(4, 'c4'))),
    rated(5, 'c4', move('c5', rated(5, 'Nc3'))),
  ],
  black: [],
};

it('weights active lines by their lowest own move', () => {
  // Given white lines at lowest levels 1 and 3, a finished line, and their
  // unseen other-colour lines, 58% confident overall

  // When the exercises are weighed
  const candidates = weighExercises(learningLines, [], always(0));

  // Then the shakier line weighs 2 to the other's 0.5, boosted 8.4% for low
  // confidence and by the root of the two unfinished lines
  const boost = 1.084 * Math.SQRT2;
  expect(candidates).toEqual([
    {
      exercise: { ...whiteLine('e4', 'e5', 'Nf3'), status: 'active' },
      weight: expect.closeTo(2 * boost),
    },
    {
      exercise: { ...whiteLine('d4', 'd5', 'c4'), status: 'active' },
      weight: expect.closeTo(0.5 * boost),
    },
  ]);
});

it('holds back recent picks while there are lines to learn', () => {
  // Given white lines at lowest levels 1 and 3 and a finished line, 58%
  // confident overall, the 1...e5 line last picked

  // When the exercises are weighed
  const candidates = weighExercises(
    learningLines,
    [whiteLine('e4', 'e5', 'Nf3')],
    always(0),
  );

  // Then that line is held back to 0.006 and the other line to 0.6, on top of
  // their level, confidence and line count weights
  const boost = 1.084 * Math.SQRT2;
  expect(candidates.map(({ weight }) => weight)).toEqual([
    expect.closeTo(2 * boost * 0.006),
    expect.closeTo(0.5 * boost * 0.6),
  ]);
});

it('weights active splits by their lowest reply', () => {
  // Given finished white lines through splits whose lowest replies are 0 and
  // 1, 86% confident overall
  const trees = {
    white: [
      rated(
        5,
        'e4',
        rated(1, 'e5', rated(5, 'Nf3')),
        rated(0, 'c5', rated(5, 'Nf3')),
      ),
      rated(
        5,
        'd4',
        rated(1, 'd5', rated(5, 'c4')),
        rated(1, 'Nf6', rated(5, 'c4')),
      ),
    ],
    black: [],
  };

  // When the exercises are weighed
  const candidates = weighExercises(trees, [], always(0));

  // Then they weigh 2 and 1, boosted 17.2% for high confidence and by the root
  // of the two unfinished splits
  const boost = 1.172 * Math.SQRT2;
  expect(candidates).toEqual([
    {
      exercise: {
        type: 'split',
        side: 'white',
        path: ['e4'],
        status: 'active',
      },
      weight: expect.closeTo(2 * boost),
    },
    {
      exercise: {
        type: 'split',
        side: 'white',
        path: ['d4'],
        status: 'active',
      },
      weight: expect.closeTo(1 * boost),
    },
  ]);
});

it('weights active other-colour lines by their lowest quizzed reply', () => {
  // Given finished white lines with lone black replies at 1 and 0, seen as
  // black, 54% confident overall
  const trees = {
    white: [
      rated(5, 'e4', rated(1, 'e5', rated(5, 'Nf3'))),
      rated(5, 'd4', rated(0, 'd5', rated(5, 'c4'))),
    ],
    black: [
      move('e4', rated(1, 'e5', move('Nf3'))),
      move('d4', rated(1, 'd5', move('c4'))),
    ],
  };

  // When the exercises are weighed
  const candidates = weighExercises(trees, [], always(0));

  // Then the white tree's other-colour lines weigh 1 and 2, boosted 10.8% for
  // confidence and by the root of the four unfinished other-colour lines
  const boost = 1.108 * 2;
  expect(
    candidates.filter(({ exercise }) => exercise.side === 'white'),
  ).toEqual([
    {
      exercise: {
        type: 'otherColour',
        side: 'white',
        path: ['e4', 'e5', 'Nf3'],
        status: 'active',
      },
      weight: expect.closeTo(1 * boost),
    },
    {
      exercise: {
        type: 'otherColour',
        side: 'white',
        path: ['d4', 'd5', 'c4'],
        status: 'active',
      },
      weight: expect.closeTo(2 * boost),
    },
  ]);
});

it('adds random unseen lines until there is enough work', () => {
  // Given five unseen white lines and nothing else seen
  const firsts = ['a3', 'b3', 'c3', 'd3', 'e3'];
  const trees = {
    white: firsts.map((first) => move(first, move('h6', move('h3')))),
    black: [],
  };

  // When the exercises are weighed, always drawing the middle of what's left
  const candidates = weighExercises(trees, [], always(0.5));

  // Then four join at 4 each, the first total over 15, boosted 20% for 0%
  // confidence and by the root of the five unfinished lines
  expect(candidates).toEqual(
    ['c3', 'd3', 'b3', 'e3'].map((first) => ({
      exercise: { ...whiteLine(first, 'h6', 'h3'), status: 'unseen' },
      weight: expect.closeTo(4 * 1.2 * Math.sqrt(5)),
    })),
  );
});

it('adds only the unseen lines there are', () => {
  // Given a single unseen white line

  // When the exercises are weighed
  const candidates = weighExercises(
    { white: [move('e4', move('e5', move('Nf3')))], black: [] },
    [],
    always(0),
  );

  // Then only that line is a candidate, not its unseen other-colour line
  expect(candidates.map(({ exercise }) => exercise)).toEqual([
    { ...whiteLine('e4', 'e5', 'Nf3'), status: 'unseen' },
  ]);
});

const activeWorth = (lastLevel: number) => ({
  white: [
    rated(0, 'a3', move('a6', rated(1, 'a4'))),
    rated(0, 'b3', move('b6', rated(1, 'b4'))),
    rated(0, 'c3', move('c6', rated(1, 'c4'))),
    rated(1, 'd3', move('d6', rated(2, 'd4'))),
    rated(lastLevel, 'e3', move('e6', rated(4, 'e4'))),
    move('h3', move('h6', move('h4'))),
  ],
  black: [],
});

it('adds no unseen line once active work reaches 15', () => {
  // Given active lines weighing 4, 4, 4, 2 and 1, and an unseen line

  // When the exercises are weighed
  const candidates = weighExercises(activeWorth(2), [], always(0));

  // Then the unseen line stays out
  expect(candidates.map(({ exercise }) => exercise.status)).not.toContain(
    'unseen',
  );
});

it('adds an unseen line while active work is under 15', () => {
  // Given active lines weighing 4, 4, 4, 2 and 0.5, and an unseen line

  // When the exercises are weighed
  const candidates = weighExercises(activeWorth(3), [], always(0));

  // Then the unseen line joins
  expect(candidates.map(({ exercise }) => exercise.status)).toContain('unseen');
});

it('revises only finished exercises once nothing is left to learn', () => {
  // Given a finished white line whose other-colour line can never be seen,
  // since the black tree lacks it
  const trees = {
    white: [rated(5, 'e4', rated(2, 'e5', rated(5, 'Nf3')))],
    black: [],
  };

  // When the exercises are weighed
  const candidates = weighExercises(trees, [], always(0));

  // Then only the line is a candidate, at an even weight
  expect(candidates).toEqual([
    {
      exercise: { ...whiteLine('e4', 'e5', 'Nf3'), status: 'finished' },
      weight: 1,
    },
  ]);
});

const finishedSplit = {
  white: [
    rated(
      5,
      'e4',
      rated(2, 'e5', rated(5, 'Nf3')),
      rated(2, 'c5', rated(5, 'Nf3')),
    ),
  ],
  black: [],
};
const e5Line = whiteLine('e4', 'e5', 'Nf3');
const split: Exercise = { type: 'split', side: 'white', path: ['e4'] };

const weights = (recent: Exercise[]) =>
  weighExercises(finishedSplit, recent, always(0)).map(({ weight }) => weight);

it('holds back the last pick and its type', () => {
  // Given two finished lines and a finished split, the 1...e5 line last picked

  // When the exercises are weighed
  const result = weights([e5Line]);

  // Then that line weighs 0.01 x 0.6, the other line 0.6, the split 1
  expect(result).toEqual([
    expect.closeTo(0.006),
    expect.closeTo(0.6),
    expect.closeTo(1),
  ]);
});

it('holds back the pick before last and its type less', () => {
  // Given the 1...e5 line picked before the split, which was picked last

  // When the exercises are weighed
  const result = weights([e5Line, split]);

  // Then that line weighs 0.1 x 0.8, the other line 0.8, the split 0.01 x 0.6
  expect(result).toEqual([
    expect.closeTo(0.08),
    expect.closeTo(0.8),
    expect.closeTo(0.006),
  ]);
});
