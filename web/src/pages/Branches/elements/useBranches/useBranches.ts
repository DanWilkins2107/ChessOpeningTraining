import { useUserFetch } from '../../../../shared/useUserFetch/useUserFetch';
import { supabase } from '../../../../supabase';
import type { BranchesResponse } from '../BranchesResponse/BranchesResponse';

const fetchBranches = (): PromiseLike<BranchesResponse> =>
  supabase
    .from('branches')
    .select('id, name, side')
    .order('created_at', { ascending: false });

export function useBranches() {
  const { value, refresh } = useUserFetch(fetchBranches);
  return { response: value, refresh };
}
