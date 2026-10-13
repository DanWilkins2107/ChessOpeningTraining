import { PostgrestError } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { createFolderErrorMessage } from './createFolderErrorMessage';

const postgrestError = (code: string, message: string) =>
  new PostgrestError({ code, message, details: '', hint: '' });

it.each([
  [
    'the folder cap',
    postgrestError('23514', 'A user can have at most 100 folders'),
    'You can have at most 100 folders',
  ],
  [
    'a refused insert',
    postgrestError('42501', 'permission denied for table folders'),
    "Couldn't create your folder, try again",
  ],
  [
    'an unreachable server',
    postgrestError('', 'TypeError: Failed to fetch'),
    "Couldn't create your folder, try again",
  ],
])('explains %s', (_case, error, message) => {
  // Given a failed create

  // When it is explained
  const explained = createFolderErrorMessage(error);

  // Then it shows the matching message
  expect(explained).toBe(message);
});
