import {
  AuthApiError,
  AuthRetryableFetchError,
  AuthWeakPasswordError,
} from '@supabase/supabase-js';
import { expect, it } from 'vitest';
import {
  TRY_AGAIN_MESSAGE,
  WRONG_CODE_MESSAGE,
} from './newPasswordErrorMessage.constants';
import { newPasswordErrorMessage } from './newPasswordErrorMessage';

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

const badCode = new AuthApiError(
  'Invalid nonce',
  422,
  'reauthentication_not_valid',
);

const offline = new AuthRetryableFetchError('Failed to fetch', 0);

it.each([
  ['a weak password', tooWeak, tooWeak.message],
  ['a password the account already has', unchanged, unchanged.message],
  ['a wrong reauthentication code', badCode, WRONG_CODE_MESSAGE],
  ['a rate limit', rateLimited, TRY_AGAIN_MESSAGE],
  ['a network failure', offline, TRY_AGAIN_MESSAGE],
])('explains %s', (_case, error, shown) => {
  // Given a rejected password update

  // When its error is explained
  const explained = newPasswordErrorMessage(error);

  // Then the matching message is shown
  expect(explained).toBe(shown);
});
