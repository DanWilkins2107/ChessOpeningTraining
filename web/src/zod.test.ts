import { expect, it } from 'vitest';
import { z } from './zod';

it('stops zod trying `new Function`, which the CSP reports as a violation', () => {
  expect(z.config().jitless).toBe(true);
});
