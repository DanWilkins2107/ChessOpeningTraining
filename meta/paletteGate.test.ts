import { expect, it } from 'vitest';
import { strayColourLiterals } from './paletteGate';

it('finds colour literals only in theme.css', () => {
  expect(strayColourLiterals()).toEqual([]);
});
