import { createClient } from '@supabase/supabase-js';
import { env } from 'node:process';
import { afterAll } from 'vitest';

const noSession = { auth: { persistSession: false, autoRefreshToken: false } };

export const admin = createClient(
  env.SUPABASE_URL!,
  env.SUPABASE_SERVICE_ROLE_KEY!,
  noSession,
);

export const anonClient = () =>
  createClient(env.SUPABASE_URL!, env.SUPABASE_ANON_KEY!, noSession);

const userIds = new Set<string>();

afterAll(() => Promise.all([...userIds].map(deleteUser)));

export async function deleteUser(id: string) {
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) throw error;
  userIds.delete(id);
}

export async function signedInUser() {
  const credentials = {
    email: `test-${crypto.randomUUID()}@example.test`,
    password: crypto.randomUUID(),
  };
  const { data, error } = await admin.auth.admin.createUser({
    ...credentials,
    email_confirm: true,
  });
  if (error) throw error;
  userIds.add(data.user.id);

  const client = anonClient();
  const signIn = await client.auth.signInWithPassword(credentials);
  if (signIn.error) throw signIn.error;
  return { id: data.user.id, email: credentials.email, client };
}
