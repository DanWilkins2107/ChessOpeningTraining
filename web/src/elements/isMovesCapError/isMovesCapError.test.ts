import { PostgrestError } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { isMovesCapError } from './isMovesCapError';

const saveError = (code: string, message: string) =>
  new PostgrestError({ code, message, details: '', hint: '' });

it.each([
  ['the ply cap', saveError('23514', 'A line can be at most 600 plies'), true],
  ['a refused update', saveError('42501', 'permission denied'), false],
  ['an unreachable server', saveError('', 'TypeError: Failed to fetch'), false],
])('tells whether %s is a cap error', (_case, error, capError) => {
  // Given a failed save

  // When it is checked
  const checked = isMovesCapError(error);

  // Then only a check_violation counts as a cap error
  expect(checked).toBe(capError);
});
