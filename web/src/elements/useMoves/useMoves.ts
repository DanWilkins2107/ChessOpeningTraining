import { useSuspenseQuery } from '@tanstack/react-query';
import { movesSchema } from '../movesSchema/movesSchema';
import { useAuthenticatedUser } from '../../shared/useAuthenticatedUser/useAuthenticatedUser';
import { supabase } from '../../supabase';
import { MOVES_QUERY_KEY } from './useMoves.constants';

async function fetchMoves(moveTreeId: string) {
  const { data, error } = await supabase
    .from('move_trees')
    .select('moves')
    .eq('id', moveTreeId)
    .single();
  if (error) throw error;
  return movesSchema.parse(data.moves);
}

export function useMoves(moveTreeId: string) {
  const userId = useAuthenticatedUser().id;
  return useSuspenseQuery({
    queryKey: [MOVES_QUERY_KEY, userId, moveTreeId],
    queryFn: () => fetchMoves(moveTreeId),
  }).data;
}
