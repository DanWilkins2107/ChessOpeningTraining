import { useUserFetch } from '../useUserFetch/useUserFetch';
import { supabase } from '../../../../supabase';
import type { RepertoireResponse } from '../RepertoireResponse/RepertoireResponse';

async function fetchRepertoire(): Promise<RepertoireResponse> {
  const [folders, moveTrees] = await Promise.all([
    supabase
      .from('folders')
      .select('id, name')
      .is('parent_id', null)
      .order('created_at', { ascending: false }),
    supabase
      .from('move_trees')
      .select('id, name, side, folder_id')
      .order('created_at', { ascending: false }),
  ]);
  return { folders, moveTrees };
}

export function useRepertoire() {
  const { value, refresh } = useUserFetch(fetchRepertoire);
  return { response: value, refresh };
}
