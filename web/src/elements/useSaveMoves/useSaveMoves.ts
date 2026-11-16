// fallow-ignore-file unused-file -- 357a3b13 2026-12-14 landed ahead of autosave (861c4b5e), its first consumer.
import type { PostgrestError } from '@supabase/supabase-js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { MoveNode } from '../MoveNode/MoveNode';
import { useAuthenticatedUser } from '../../shared/useAuthenticatedUser/useAuthenticatedUser';
import { supabase } from '../../supabase';
import { MOVES_QUERY_KEY } from '../useMoves/useMoves.constants';

async function saveMoves(moveTreeId: string, moves: MoveNode[]) {
  const { error } = await supabase
    .from('move_trees')
    .update({ moves })
    .eq('id', moveTreeId)
    .select('id')
    .single();
  if (error) throw error;
}

export function useSaveMoves(moveTreeId: string) {
  const userId = useAuthenticatedUser().id;
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation<void, PostgrestError, MoveNode[]>({
    mutationFn: (moves) => saveMoves(moveTreeId, moves),
    onSuccess: (_, moves) =>
      queryClient.setQueryData<MoveNode[]>(
        [MOVES_QUERY_KEY, userId, moveTreeId],
        moves,
      ),
  });

  return mutateAsync;
}
