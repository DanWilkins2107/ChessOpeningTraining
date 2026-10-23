import { expect, it } from 'vitest';
import { trainingRequestSchema } from './trainingRequest';

const daysFromToday = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

const validRequest = {
  treeIds: [crypto.randomUUID()],
  path: ['e4'],
  confidenceChanges: [1],
  day: daysFromToday(0),
};

it.each([-1, 0, 1])('accepts a day %i from today', (days) => {
  expect(
    trainingRequestSchema.safeParse({
      ...validRequest,
      day: daysFromToday(days),
    }).success,
  ).toBe(true);
});

it.each([
  ['no move trees', { treeIds: [] }],
  ['an empty path', { path: [], confidenceChanges: [] }],
  ['a path over 600 moves', { path: Array(601).fill('e4') }],
  ['fewer changes than moves', { confidenceChanges: [] }],
  ['a change over 5', { confidenceChanges: [6] }],
  ['a change under -5', { confidenceChanges: [-6] }],
  ['a day before yesterday', { day: daysFromToday(-2) }],
  ['a day after tomorrow', { day: daysFromToday(2) }],
])('rejects %s', (_, invalid) => {
  expect(
    trainingRequestSchema.safeParse({ ...validRequest, ...invalid }).success,
  ).toBe(false);
});
