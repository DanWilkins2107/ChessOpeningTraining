import { useMemo } from 'react';
import { useUser } from '../../../../../shared/useUser/useUser';
import { supabase } from '../../../../../supabase';
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
    .select('name, move_trees(id, name)')
    .eq('id', folderId)
    .order('position', { referencedTable: 'move_trees' })
    .maybeSingle();
}
