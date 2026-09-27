import type { PostgrestMaybeSingleResponse } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../../../supabase';
import { useUser } from '../../../../shared/useUser/useUser';
import type { AnimatePiecesSetting } from '../AnimatePiecesSetting/AnimatePiecesSetting';
import { ANIMATE_PIECES_QUERY_KEY } from './useAnimatePieces.constants';

type ProfileResponse = PostgrestMaybeSingleResponse<{
  animate_pieces: boolean;
}>;

const LOADING: AnimatePiecesSetting = { status: 'loading' };

// A user without a profiles row has never saved the setting, so they get the
// column's default.
const settingFrom = ({ data, error }: ProfileResponse): AnimatePiecesSetting =>
  error
    ? { status: 'failed' }
    : { status: 'loaded', animatePieces: data?.animate_pieces ?? true };

const fetchSetting = async () =>
  settingFrom(await supabase.from('profiles').select().maybeSingle());

export function useAnimatePieces(): AnimatePiecesSetting {
  const userId = useUser()?.id;
  const { data } = useQuery({
    queryKey: [ANIMATE_PIECES_QUERY_KEY, userId],
    queryFn: fetchSetting,
    enabled: userId !== undefined,
  });
  return data ?? LOADING;
}
