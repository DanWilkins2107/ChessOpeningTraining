import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.116.0';

export async function signedInUserId(admin: SupabaseClient, request: Request) {
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '');
  const { data } = await admin.auth.getUser(token);
  return data.user?.id;
}
