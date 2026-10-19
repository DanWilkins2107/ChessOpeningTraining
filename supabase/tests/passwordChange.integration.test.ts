import { expect, it } from 'vitest';
import { latestMailTo } from './tests-shared/mailpit';
import { signedToken } from './tests-shared/signedToken';
import { anonClient, signedInUser } from './tests-shared/testUsers';

// The auth server asks for a code only from a session over a day old, which a
// test cannot wait for. A token with no session at all is treated the same way.
async function staleSessionUser() {
  const { id, email } = await signedInUser();
  const now = Math.floor(Date.now() / 1000);
  const client = anonClient();
  const { error } = await client.auth.setSession({
    access_token: signedToken({
      sub: id,
      role: 'authenticated',
      aud: 'authenticated',
      iat: now,
      exp: now + 60,
    }),
    refresh_token: 'unused',
  });
  if (error) throw error;
  return { email, client };
}

const codeMailedTo = async (address: string) =>
  (await latestMailTo(address)).match(/\b(\d{6})\b/)![1];

async function codeRequested() {
  const user = await staleSessionUser();
  const { error } = await user.client.auth.reauthenticate();
  if (error) throw error;
  return user;
}

const unusedPassword = () => `Aa1!${crypto.randomUUID()}`;

const signsInWith = async (email: string, password: string) =>
  !(await anonClient().auth.signInWithPassword({ email, password })).error;

it('asks a stale session for a code before changing the password', async () => {
  // Given a user whose session is too old to change the password freely
  const { email, client } = await staleSessionUser();
  const password = unusedPassword();

  // When they change it without a code
  const { error } = await client.auth.updateUser({ password });

  // Then they are asked to reauthenticate, and the password is unchanged
  expect(error?.code).toBe('reauthentication_needed');
  expect(await signsInWith(email, password)).toBe(false);
});

it('changes the password with the emailed code', async () => {
  // Given a stale session that has asked for a code
  const { email, client } = await codeRequested();
  const password = unusedPassword();

  // When they change the password with the code from their inbox
  const { error } = await client.auth.updateUser({
    password,
    nonce: await codeMailedTo(email),
  });

  // Then the account signs in with the new password
  expect(error).toBeNull();
  expect(await signsInWith(email, password)).toBe(true);
});

it('refuses a wrong code', async () => {
  // Given a stale session that has asked for a code
  const { email, client } = await codeRequested();
  const password = unusedPassword();

  // When they change the password with a code they were not sent
  const { error } = await client.auth.updateUser({ password, nonce: '000000' });

  // Then the change is refused
  expect(error?.code).toBe('reauthentication_not_valid');
  expect(await signsInWith(email, password)).toBe(false);
});
