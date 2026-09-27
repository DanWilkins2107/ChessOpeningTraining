import { expect, it } from 'vitest';
import { unjustifiedAssertions } from './assertionJustificationGate';

it('every type assertion says why the type cannot be expressed without it', () => {
  expect(unjustifiedAssertions()).toEqual([]);
});
