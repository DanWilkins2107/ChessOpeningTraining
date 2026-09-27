import { PostgrestError } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { createBranchErrorMessage } from './createBranchErrorMessage';

const postgrestError = (code: string, message: string) =>
  new PostgrestError({ code, message, details: '', hint: '' });

it.each([
  [
    'the branch cap',
    postgrestError('23514', 'A user can have at most 100 branches'),
    'You can have at most 100 branches',
  ],
  [
    'a refused insert',
    postgrestError('42501', 'permission denied for table branches'),
    "Couldn't create your branch, try again",
  ],
  [
    'an unreachable server',
    postgrestError('', 'TypeError: Failed to fetch'),
    "Couldn't create your branch, try again",
  ],
])('explains %s', (_case, error, message) => {
  // Given a failed create

  // When it is explained
  const explained = createBranchErrorMessage(error);

  // Then it shows the matching message
  expect(explained).toBe(message);
});
