import type { SupabaseClient } from '@supabase/supabase-js';

export async function existingFolderId(
  client: SupabaseClient,
): Promise<string> {
  const { data, error } = await client
    .from('folders')
    .insert({ name: 'Caro-Kann' })
    .select()
    .single();
  if (error) throw error;
  return data.id;
}
