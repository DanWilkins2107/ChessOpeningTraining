import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthenticatedUser } from '../../../../shared/useAuthenticatedUser/useAuthenticatedUser';
import { supabase } from '../../../../supabase';
import { ANIMATE_PIECES_QUERY_KEY } from '../useAnimatePieces/useAnimatePieces.constants';

async function saveSetting(animatePieces: boolean) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ animate_pieces: animatePieces });
  if (error) throw error;
}

export function useUpdateAnimatePieces() {
  const userId = useAuthenticatedUser().id;
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: saveSetting,
    onSuccess: (_, animatePieces) =>
      queryClient.setQueryData<boolean>(
        [ANIMATE_PIECES_QUERY_KEY, userId],
        animatePieces,
      ),
  });

  return mutateAsync;
}
