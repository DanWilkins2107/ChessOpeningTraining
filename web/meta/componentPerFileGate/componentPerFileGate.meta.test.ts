import { expect, it } from 'vitest';
import {
  componentPerFileProblems,
  componentSources,
} from './componentPerFileGate';

const sources = componentSources();

it('declares at most one component or hook per module', () => {
  expect(Object.keys(sources).length).toBeGreaterThan(0);
  expect(componentPerFileProblems(sources)).toEqual([]);
});
