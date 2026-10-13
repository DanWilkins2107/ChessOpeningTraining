import { expect, it } from 'vitest';
import { createQueryClient } from './createQueryClient';
import { QUERY_CLIENT_DEFAULT_OPTIONS } from './createQueryClient.constants';

it('applies the shared default options', () => {
  expect(createQueryClient().getDefaultOptions()).toEqual(
    QUERY_CLIENT_DEFAULT_OPTIONS,
  );
});

it('gives each caller its own client', () => {
  expect(createQueryClient()).not.toBe(createQueryClient());
});
