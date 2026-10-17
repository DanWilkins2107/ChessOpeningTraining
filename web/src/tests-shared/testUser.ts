import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { afterAll, afterEach, beforeAll, onTestFinished } from 'vitest';
import { env } from '../env';
import { supabase } from '../supabase';

const adminClient = createClient(
  env.VITE_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

type Credentials = { email: string; password: string };

const newCredentials = (
  password: string = crypto.randomUUID(),
): Credentials => ({
  email: `test-${crypto.randomUUID()}@example.test`,
  password,
});

async function createUser(credentials: Credentials, emailConfirmed: boolean) {
  const { data, error } = await adminClient.auth.admin.createUser({
    ...credentials,
    email_confirm: emailConfirmed,
  });
  if (error) throw error;
  return data.user.id;
}

// A test may have deleted the account itself.
async function removeUser(id: string) {
  const { error } = await adminClient.auth.admin.deleteUser(id);
  if (error && error.code !== 'user_not_found') throw error;
}

const signOut = () => supabase.auth.signOut({ scope: 'local' });

async function signInWith(client: SupabaseClient, credentials: Credentials) {
  const { error } = await client.auth.signInWithPassword(credentials);
  if (error) throw error;
}

const signInAs = (credentials: Credentials) => () =>
  signInWith(supabase, credentials);

// A separate client signed in as the user, for seeding data or acting as
// another device without touching the app's session.
const signedInClientAs = (credentials: Credentials) =>
  async function signedInClient() {
    const client = createClient(
      env.VITE_SUPABASE_URL,
      env.VITE_SUPABASE_ANON_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    await signInWith(client, credentials);
    return client;
  };

export function registerTestUser({
  emailConfirmed = true,
  password,
}: { emailConfirmed?: boolean; password?: string } = {}) {
  const credentials = newCredentials(password);
  const user = { id: '' };

  beforeAll(async () => {
    user.id = await createUser(credentials, emailConfirmed);
  });

  afterAll(() => removeUser(user.id));

  afterEach(signOut);

  return {
    user,
    credentials,
    signIn: signInAs(credentials),
    signedInClient: signedInClientAs(credentials),
  };
}

// A user for one test only, for tests that leave the account changed.
export async function createTestUser() {
  const credentials = newCredentials();
  const id = await createUser(credentials, true);

  onTestFinished(async () => {
    await signOut();
    await removeUser(id);
  });

  return { credentials, signIn: signInAs(credentials) };
}

// An email for the app to sign up itself. Generating a link returns the
// account's id for deletion, creating the account if no test did.
export function registerSignUpEmail() {
  const email = `test-${crypto.randomUUID()}@example.test`;

  afterAll(async () => {
    const { data, error } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (error) throw error;
    const deleted = await adminClient.auth.admin.deleteUser(data.user.id);
    if (deleted.error) throw deleted.error;
  });

  return email;
}
