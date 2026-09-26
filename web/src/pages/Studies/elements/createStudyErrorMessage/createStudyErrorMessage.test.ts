import { PostgrestError } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { createStudyErrorMessage } from './createStudyErrorMessage';

const postgrestError = (code: string, message: string) =>
  new PostgrestError({ code, message, details: '', hint: '' });

it.each([
  [
    'the study cap',
    postgrestError('23514', 'A user can have at most 100 studies'),
    'You can have at most 100 studies',
  ],
  [
    'a refused insert',
    postgrestError('42501', 'permission denied for table studies'),
    "Couldn't create your study, try again",
  ],
  [
    'an unreachable server',
    postgrestError('', 'TypeError: Failed to fetch'),
    "Couldn't create your study, try again",
  ],
])('explains %s', (_case, error, message) => {
  // Given a failed create

  // When it is explained
  const explained = createStudyErrorMessage(error);

  // Then it shows the matching message
  expect(explained).toBe(message);
});
