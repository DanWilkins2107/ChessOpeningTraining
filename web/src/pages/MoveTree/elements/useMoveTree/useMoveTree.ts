import { useSuspenseQuery } from '@tanstack/react-query';
import { useAuthenticatedUser } from '../../../../shared/useAuthenticatedUser/useAuthenticatedUser';
import { supabase } from '../../../../supabase';
import { MOVE_TREE_QUERY_KEY } from './useMoveTree.constants';

async function fetchMoveTree(moveTreeId: string) {
  const { data, error } = await supabase
    .from('move_trees')
    .select('name, side')
    .eq('id', moveTreeId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function useMoveTree(moveTreeId: string) {
  const userId = useAuthenticatedUser().id;
  return useSuspenseQuery({
    queryKey: [MOVE_TREE_QUERY_KEY, userId, moveTreeId],
    queryFn: () => fetchMoveTree(moveTreeId),
  }).data;
}
