import { useMemo } from 'react';
import { useUser } from '../../../../shared/useUser/useUser';
import { supabase } from '../../../../supabase';
import type { FolderResponse } from '../FolderResponse/FolderResponse';

export function useFolder(folderId: string) {
  const userId = useUser()?.id;

  return useMemo(
    () => (userId === undefined ? undefined : fetchFolder(folderId)),
    [userId, folderId],
  );
}

async function fetchFolder(folderId: string): Promise<FolderResponse> {
  return supabase
    .from('folders')
    .select('name, chapters(id, name)')
    .eq('id', folderId)
    .order('created_at', { referencedTable: 'chapters' })
    .order('id', { referencedTable: 'chapters' })
    .maybeSingle();
}
