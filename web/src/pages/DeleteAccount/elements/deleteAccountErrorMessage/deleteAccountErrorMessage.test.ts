import { expect, it } from 'vitest';
import { deleteAccountErrorMessage } from './deleteAccountErrorMessage';

it('says the password is wrong when the server rejects it', () => {
  expect(deleteAccountErrorMessage({ code: 'invalid_credentials' })).toBe(
    'Incorrect password',
  );
});

it('asks them to try again for any other failure', () => {
  expect(deleteAccountErrorMessage({ code: '42501' })).toBe(
    "Couldn't delete your account, try again",
  );
});
