import { useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '../../../../supabase';
import type { Folder } from '../Folder/Folder';
import { FOLDERS_QUERY_KEY } from './useFolders.constants';

async function fetchFolders(): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('id, name')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function useFolders(userId: string) {
  return useSuspenseQuery({
    queryKey: [FOLDERS_QUERY_KEY, userId],
    queryFn: fetchFolders,
  }).data;
}
