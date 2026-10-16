import { env } from 'node:process';
import { expect, it } from 'vitest';
import { latestMailTo } from './tests-shared/mailpit';
import { signedToken } from './tests-shared/signedToken';
import { anonClient, signedInUser } from './tests-shared/testUsers';

// The auth server asks for a code only from a session over a day old, which a
// test cannot wait for. A token with no session at all is treated the same way.
async function staleSessionUser() {
  const { id, email } = await signedInUser();
  const now = Math.floor(Date.now() / 1000);
  const token = signedToken({
    sub: id,
    role: 'authenticated',
    aud: 'authenticated',
    iat: now,
    exp: now + 60,
  });
  return { email, token };
}

const authRequest = (token: string, path: string, init: RequestInit = {}) =>
  fetch(new URL(`/auth/v1/${path}`, env.SUPABASE_URL), {
    ...init,
    headers: {
      apikey: env.SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

async function changePassword(
  token: string,
  password: string,
  nonce?: string,
): Promise<{ error_code?: string }> {
  const response = await authRequest(token, 'user', {
    method: 'PUT',
    body: JSON.stringify({ password, nonce }),
  });
  return response.json();
}

const codeMailedTo = async (address: string) =>
  (await latestMailTo(address)).match(/\b(\d{6})\b/)![1];

const unusedPassword = () => `Aa1!${crypto.randomUUID()}`;

const signsInWith = async (email: string, password: string) =>
  !(await anonClient().auth.signInWithPassword({ email, password })).error;

it('asks a stale session for a code before changing the password', async () => {
  // Given a user whose session is too old to change the password freely
  const { email, token } = await staleSessionUser();
  const password = unusedPassword();

  // When they change it without a code
  const { error_code } = await changePassword(token, password);

  // Then they are asked to reauthenticate, and the password is unchanged
  expect(error_code).toBe('reauthentication_needed');
  expect(await signsInWith(email, password)).toBe(false);
});

it('changes the password with the emailed code', async () => {
  // Given a stale session that has asked for a code
  const { email, token } = await staleSessionUser();
  await authRequest(token, 'reauthenticate');
  const password = unusedPassword();

  // When they change the password with the code from their inbox
  const { error_code } = await changePassword(
    token,
    password,
    await codeMailedTo(email),
  );

  // Then the account signs in with the new password
  expect(error_code).toBeUndefined();
  expect(await signsInWith(email, password)).toBe(true);
});

it('refuses a wrong code', async () => {
  // Given a stale session that has asked for a code
  const { email, token } = await staleSessionUser();
  await authRequest(token, 'reauthenticate');
  const password = unusedPassword();

  // When they change the password with a code they were not sent
  const { error_code } = await changePassword(token, password, '000000');

  // Then the change is refused
  expect(error_code).toBe('reauthentication_not_valid');
  expect(await signsInWith(email, password)).toBe(false);
});
