import { AuthApiError, AuthRetryableFetchError } from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { signInErrorMessage } from './signInErrorMessage';

it.each([
  [
    'incorrect credentials',
    new AuthApiError('Invalid login credentials', 400, 'invalid_credentials'),
    'Incorrect email or password',
  ],
  [
    'an unconfirmed email',
    new AuthApiError('Email not confirmed', 400, 'email_not_confirmed'),
    'Confirm your email first',
  ],
  [
    'a rate limit',
    new AuthApiError('Too many requests', 429, 'over_request_rate_limit'),
    "Couldn't sign in, try again",
  ],
  [
    'a network failure',
    new AuthRetryableFetchError('Failed to fetch', 0),
    "Couldn't sign in, try again",
  ],
])('explains %s', (_case, error, message) => {
  // Given a sign-in error

  // When it is explained
  const explained = signInErrorMessage(error);

  // Then it shows the matching message
  expect(explained).toBe(message);
});
