import {
  AuthApiError,
  AuthRetryableFetchError,
  AuthWeakPasswordError,
} from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { signUpErrorMessage } from './signUpErrorMessage';

it('shows the weak password message from the server', () => {
  // Given a weak password error
  const message = `Password should be at least ${crypto.randomUUID()}`;
  const error = new AuthWeakPasswordError(message, 422, ['length']);

  // When it is explained
  const explained = signUpErrorMessage(error);

  // Then it is the server's message
  expect(explained).toBe(message);
});

it.each([
  [
    'a rate limit',
    new AuthApiError('Too many requests', 429, 'over_request_rate_limit'),
  ],
  ['a network failure', new AuthRetryableFetchError('Failed to fetch', 0)],
])('gives a generic message for %s', (_case, error) => {
  // Given a sign-up error that is not about the password

  // When it is explained
  const explained = signUpErrorMessage(error);

  // Then it asks them to try again
  expect(explained).toBe("Couldn't sign up, try again");
});
