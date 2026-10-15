import { useUserFetch } from '../useUserFetch/useUserFetch';
import { supabase } from '../../../../supabase';
import type { FoldersResponse } from '../FoldersResponse/FoldersResponse';

const fetchFolders = (): PromiseLike<FoldersResponse> =>
  supabase
    .from('folders')
    .select('id, name, side')
    .order('created_at', { ascending: false });

export function useFolders() {
  const { value, refresh } = useUserFetch(fetchFolders);
  return { response: value, refresh };
}
