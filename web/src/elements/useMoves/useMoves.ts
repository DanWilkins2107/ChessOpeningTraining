// fallow-ignore-file unused-file -- ed293461 2026-11-15 landed ahead of the move tree page, its first consumer.
import { useQuery } from '@tanstack/react-query';
import { movesSchema } from '../movesSchema/movesSchema';
import { useUser } from '../../shared/useUser/useUser';
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
  const userId = useUser()?.id;
  return useQuery({
    queryKey: [MOVES_QUERY_KEY, userId, moveTreeId],
    queryFn: () => fetchMoves(moveTreeId),
    enabled: userId !== undefined,
  });
}
