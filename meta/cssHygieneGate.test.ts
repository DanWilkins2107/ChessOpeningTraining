import { expect, it } from 'vitest';
import { stylesheetHygieneProblems } from './cssHygieneGate';

it('every stylesheet is a sibling import with no dead classes', () => {
  expect(stylesheetHygieneProblems()).toEqual([]);
});
