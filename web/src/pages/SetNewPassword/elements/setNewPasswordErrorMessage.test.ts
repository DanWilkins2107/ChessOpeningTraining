import {
  AuthApiError,
  AuthRetryableFetchError,
  AuthWeakPasswordError,
} from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import { setNewPasswordErrorMessage } from './setNewPasswordErrorMessage';

const TRY_AGAIN = "Couldn't set your password, try again";

const tooWeak = new AuthWeakPasswordError(
  `Password should ${crypto.randomUUID()}`,
  422,
  ['characters'],
);

const unchanged = new AuthApiError(
  `New password should ${crypto.randomUUID()}`,
  422,
  'same_password',
);

const rateLimited = new AuthApiError(
  'Too many requests',
  429,
  'over_request_rate_limit',
);

const offline = new AuthRetryableFetchError('Failed to fetch', 0);

it.each([
  ['a weak password', tooWeak, tooWeak.message],
  ['a password the account already has', unchanged, unchanged.message],
  ['a rate limit', rateLimited, TRY_AGAIN],
  ['a network failure', offline, TRY_AGAIN],
])('explains %s', (_case, error, shown) => {
  // Given a rejected password update

  // When its error is explained
  const explained = setNewPasswordErrorMessage(error);

  // Then the matching message is shown
  expect(explained).toBe(shown);
});
