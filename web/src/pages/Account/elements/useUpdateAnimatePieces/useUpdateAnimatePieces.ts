import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../../supabase';
import { useUser } from '../../../../shared/useUser/useUser';
import type { AnimatePiecesSetting } from '../AnimatePiecesSetting/AnimatePiecesSetting';
import { ANIMATE_PIECES_QUERY_KEY } from '../useAnimatePieces/useAnimatePieces.constants';

async function saveSetting(animatePieces: boolean) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ animate_pieces: animatePieces });
  if (error) throw error;
}

export function useUpdateAnimatePieces() {
  const userId = useUser()?.id;
  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation({
    mutationFn: saveSetting,
    onSuccess: (_, animatePieces) =>
      queryClient.setQueryData<AnimatePiecesSetting>(
        [ANIMATE_PIECES_QUERY_KEY, userId],
        { status: 'loaded', animatePieces },
      ),
  });

  return (animatePieces: boolean) =>
    mutateAsync(animatePieces).then(
      () => true,
      () => false,
    );
}
