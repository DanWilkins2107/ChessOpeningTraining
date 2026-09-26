import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { resetOutcome } from './resetOutcome';

it.each([
  ['no error', null, 'sent'],
  [
    'the per-user send limit',
    new AuthApiError(
      'For security purposes, you can only request this after 60 seconds.',
      429,
      'over_email_send_rate_limit',
    ),
    'sent',
  ],
  [
    'an invalid email',
    new AuthApiError(
      'Unable to validate email address: invalid format',
      400,
      'validation_failed',
    ),
    'failed',
  ],
  [
    'a network failure',
    new AuthRetryableFetchError('Failed to fetch', 0),
    'failed',
  ],
])('treats %s as %s', (_case, error, outcome) => {
  // Given a reset email response

  // When its outcome is read
  const read = resetOutcome(error);

  // Then it is the matching outcome
  expect(read).toBe(outcome);
});
