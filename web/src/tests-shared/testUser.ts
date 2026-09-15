import { createClient } from '@supabase/supabase-js';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { env } from '../env';
import { supabase } from '../supabase';

const admin = createClient(
  env.VITE_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export function registerTestUser({ emailConfirmed = true } = {}) {
  const credentials = {
    email: `test-${crypto.randomUUID()}@example.test`,
    password: crypto.randomUUID(),
  };
  const user = { id: '' };

  beforeAll(async () => {
    const { data, error } = await admin.auth.admin.createUser({
      ...credentials,
      email_confirm: emailConfirmed,
    });
    if (error) throw error;
    user.id = data.user.id;
  });

  afterAll(async () => {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  });

  afterEach(() => supabase.auth.signOut({ scope: 'local' }));

  async function signIn(client = supabase) {
    const { error } = await client.auth.signInWithPassword(credentials);
    if (error) throw error;
  }

  return { user, credentials, signIn };
}

// An email for the app to sign up itself. Generating a link returns the
// account's id for deletion, creating the account if no test did.
export function registerSignUpEmail() {
  const email = `test-${crypto.randomUUID()}@example.test`;

  afterAll(async () => {
    const { data, error } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });
    if (error) throw error;
    const deleted = await admin.auth.admin.deleteUser(data.user.id);
    if (deleted.error) throw deleted.error;
  });

  return email;
}
