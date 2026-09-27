import { useMemo } from 'react';
import { useUser } from '../../../../shared/useUser/useUser';
import { supabase } from '../../../../supabase';
import type { BranchResponse } from '../BranchResponse/BranchResponse';

export function useBranch(branchId: string) {
  const userId = useUser()?.id;

  return useMemo(
    () => (userId === undefined ? undefined : fetchBranch(branchId)),
    [userId, branchId],
  );
}

async function fetchBranch(branchId: string): Promise<BranchResponse> {
  return supabase
    .from('branches')
    .select('name, chapters(id, name)')
    .eq('id', branchId)
    .order('created_at', { referencedTable: 'chapters' })
    .order('id', { referencedTable: 'chapters' })
    .maybeSingle();
}
