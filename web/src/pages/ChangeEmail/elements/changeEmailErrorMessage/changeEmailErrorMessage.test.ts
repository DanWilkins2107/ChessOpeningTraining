import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { changeEmailErrorMessage } from './changeEmailErrorMessage';

it.each([
  ['email_exists', 'That email is already in use'],
  ['email_address_invalid', 'Enter a valid email address'],
  ['validation_failed', 'Enter a valid email address'],
  ['over_email_send_rate_limit', 'Too many attempts, try again later'],
  ['over_request_rate_limit', 'Too many attempts, try again later'],
])('explains %s', (code, expected) => {
  // Given a change email error with this code
  const error = new AuthApiError(crypto.randomUUID(), 422, code);

  // When it is explained
  const explained = changeEmailErrorMessage(error);

  // Then it is in the app's words
  expect(explained).toBe(expected);
});

it('gives a generic message for anything else', () => {
  // Given a network failure
  const error = new AuthRetryableFetchError('Failed to fetch', 0);

  // When it is explained
  const explained = changeEmailErrorMessage(error);

  // Then it asks them to try again
  expect(explained).toBe("Couldn't change your email, try again");
});
