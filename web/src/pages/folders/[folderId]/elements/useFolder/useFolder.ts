import { useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '../../../../../supabase';
import type { MoveTree } from '../MoveTree/MoveTree';
import { FOLDER_QUERY_KEY } from './useFolder.constants';

type FolderWithMoveTrees = { name: string; move_trees: MoveTree[] };

export function useFolder(userId: string, folderId: string) {
  const { data } = useSuspenseQuery({
    queryKey: [FOLDER_QUERY_KEY, userId, folderId],
    queryFn: () => fetchFolder(folderId),
  });
  return data;
}

async function fetchFolder(
  folderId: string,
): Promise<FolderWithMoveTrees | null> {
  const { data } = await supabase
    .from('folders')
    .select('name, move_trees(id, name)')
    .eq('id', folderId)
    .order('created_at', { referencedTable: 'move_trees' })
    .order('id', { referencedTable: 'move_trees' })
    .maybeSingle()
    .throwOnError();
  return data;
}
