import { PostgrestError } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { createMoveTreeErrorMessage } from './createMoveTreeErrorMessage';

const moveTreeInsertError = (code: string, message: string) =>
  new PostgrestError({ code, message, details: '', hint: '' });

it.each([
  [
    'the move tree cap',
    moveTreeInsertError('23514', 'A user can have at most 500 move trees'),
    'You can have at most 500 move trees',
  ],
  [
    'a refused insert',
    moveTreeInsertError('42501', 'permission denied for table move_trees'),
    "Couldn't create your move tree, try again",
  ],
  [
    'an unreachable server',
    moveTreeInsertError('', 'TypeError: Failed to fetch'),
    "Couldn't create your move tree, try again",
  ],
])('explains %s', (_case, error, message) => {
  // Given a failed create

  // When it is explained
  const explained = createMoveTreeErrorMessage(error);

  // Then it shows the matching message
  expect(explained).toBe(message);
});
