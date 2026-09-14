import { createClient } from '@supabase/supabase-js';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { env } from '../src/env';
import { supabase } from '../src/supabase';

const admin = createClient(
  env.VITE_SUPABASE_URL,
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export function registerTestUser() {
  const credentials = {
    email: `test-${crypto.randomUUID()}@example.test`,
    password: crypto.randomUUID(),
  };
  const user = { id: '' };

  beforeAll(async () => {
    const { data, error } = await admin.auth.admin.createUser({
      ...credentials,
      email_confirm: true,
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

  return { user, signIn };
}
