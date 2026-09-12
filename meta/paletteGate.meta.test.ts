import { expect, it } from 'vitest';
import { strayColourLiterals } from './paletteGate';

it('every colour comes from a variable, not a literal', () => {
  expect(strayColourLiterals()).toEqual([]);
});
