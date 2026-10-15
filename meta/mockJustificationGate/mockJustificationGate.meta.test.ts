import { expect, it } from 'vitest';
import { unjustifiedMocks } from './mockJustificationGate';

it('every mock and stub says why the real thing cannot be used', () => {
  expect(unjustifiedMocks()).toEqual([]);
});
