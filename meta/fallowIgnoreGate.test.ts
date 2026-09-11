import { expect, it } from 'vitest';
import { rottenIgnores } from './fallowIgnoreGate';

it('finds no open-ended unused-file ignores', () => {
  expect(rottenIgnores()).toEqual([]);
});
