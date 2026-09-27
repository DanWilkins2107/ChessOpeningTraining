import { expect, it } from 'vitest';
import { createQueryClient } from './createQueryClient';

it('fails queries and mutations straight away instead of retrying', () => {
  expect(createQueryClient().getDefaultOptions()).toEqual({
    queries: { retry: false },
    mutations: { retry: false },
  });
});

it('gives each caller its own client', () => {
  expect(createQueryClient()).not.toBe(createQueryClient());
});
