import { startTransition, useMemo, useState } from 'react';
import { useUser } from '../../../../../shared/useUser/useUser';
import { supabase } from '../../../../../supabase';
import type { FolderResponse } from '../FolderResponse/FolderResponse';

type Refetch = {
  of: Promise<FolderResponse>;
  folder: Promise<FolderResponse>;
};

export function useFolder(folderId: string) {
  const userId = useUser()?.id;
  const [refetch, setRefetch] = useState<Refetch>();

  const fetched = useMemo(
    () => (userId === undefined ? undefined : fetchFolder(folderId)),
    [userId, folderId],
  );

  // A refetch only stands in for the fetch it was made from, so a new folder or
  // user drops it.
  const folder = refetch && refetch.of === fetched ? refetch.folder : fetched;

  const refresh = () => {
    if (fetched === undefined) return;
    // A transition keeps the folder on screen while it refetches, instead of
    // falling back to loading.
    startTransition(() =>
      setRefetch({ of: fetched, folder: fetchFolder(folderId) }),
    );
  };

  return { folder, refresh };
}

async function fetchFolder(folderId: string): Promise<FolderResponse> {
  return supabase
    .from('folders')
    .select('name, move_trees(id, name)')
    .eq('id', folderId)
    .order('created_at', { referencedTable: 'move_trees' })
    .order('id', { referencedTable: 'move_trees' })
    .maybeSingle();
}
