import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';
import { env } from 'node:process';
import { expect, it } from 'vitest';
import {
  admin,
  anonClient,
  forgetUser,
  signedInUser,
} from './tests-shared/testUsers';
import { PERMISSION_DENIED } from './tests-shared/pgErrorCodes';

const deleteOwnAccount = (client: SupabaseClient) =>
  client.rpc('delete_own_account');

const accountExists = async (id: string) =>
  !(await admin.auth.admin.getUserById(id)).error;

async function deletedOwnAccount(id: string, client: SupabaseClient) {
  const { error } = await deleteOwnAccount(client);
  if (error) throw error;
  forgetUser(id);
}

async function signedInByMagicLink() {
  const { id, email } = await signedInUser();
  const { data, error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });
  if (error) throw error;
  const client = anonClient();
  const verified = await client.auth.verifyOtp({
    type: 'magiclink',
    token_hash: data.properties.hashed_token,
  });
  if (verified.error) throw verified.error;
  return { id, client };
}

const base64url = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url');

// The auth server only stamps the time a password was entered, so a stale
// entry has to be signed here, with the stack's own secret.
function clientWithPasswordEnteredSecondsAgo(id: string, seconds: number) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${base64url({ alg: 'HS256', typ: 'JWT' })}.${base64url({
    sub: id,
    role: 'authenticated',
    aud: 'authenticated',
    iat: now,
    exp: now + 60,
    amr: [{ method: 'password', timestamp: now - seconds }],
  })}`;
  const signature = createHmac('sha256', env.SUPABASE_JWT_SECRET!)
    .update(unsigned)
    .digest('base64url');
  return createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${unsigned}.${signature}` } },
  });
}

it('deletes the account of a user who just entered their password', async () => {
  // Given a user who just signed in with their password
  const { id, client } = await signedInUser();

  // When they delete their account
  await deletedOwnAccount(id, client);

  // Then the account is gone
  expect(await accountExists(id)).toBe(false);
});

it('deletes their studies with it', async () => {
  // Given a user with a study
  const { id, client } = await signedInUser();
  const study = await client
    .from('studies')
    .insert({ name: 'Caro-Kann', side: 'black' })
    .select()
    .single();
  expect(study.error).toBeNull();

  // When they delete their account
  await deletedOwnAccount(id, client);

  // Then the study is gone
  const { data } = await admin
    .from('studies')
    .select()
    .eq('id', study.data.id)
    .maybeSingle();
  expect(data).toBeNull();
});

it('leaves other accounts alone', async () => {
  // Given two users
  const other = await signedInUser();
  const { id, client } = await signedInUser();

  // When one deletes their account
  await deletedOwnAccount(id, client);

  // Then the other account is still there
  expect(await accountExists(other.id)).toBe(true);
});

it('refuses a session that never entered a password', async () => {
  // Given a user signed in by magic link
  const { id, client } = await signedInByMagicLink();

  // When they delete their account
  const { error } = await deleteOwnAccount(client);

  // Then it is refused, and the account is kept
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await accountExists(id)).toBe(true);
});

it('refuses a password entered over 5 minutes ago', async () => {
  // Given a session whose password was entered 5 minutes and 1 second ago
  const { id } = await signedInUser();
  const client = clientWithPasswordEnteredSecondsAgo(id, 301);

  // When they delete their account
  const { error } = await deleteOwnAccount(client);

  // Then it is refused, and the account is kept
  expect(error?.code).toBe(PERMISSION_DENIED);
  expect(await accountExists(id)).toBe(true);
});

it('refuses a signed-out visitor', async () => {
  // Given a signed-out visitor

  // When they call delete account
  const { error } = await deleteOwnAccount(anonClient());

  // Then it is refused
  expect(error?.code).toBe(PERMISSION_DENIED);
});
