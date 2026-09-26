import { createClient } from '@supabase/supabase-js';
import { env } from '../env';
import type { registerTestUser } from './testUser';

export const isProfilesRequest = (input: RequestInfo | URL) =>
  String(input).includes('/rest/v1/profiles');

export async function turnOffAnimationFor(
  user: ReturnType<typeof registerTestUser>,
) {
  const client = createClient(
    env.VITE_SUPABASE_URL,
    env.VITE_SUPABASE_ANON_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  await user.signIn(client);
  const { error } = await client
    .from('profiles')
    .upsert({ animate_pieces: false });
  if (error) throw error;
}
