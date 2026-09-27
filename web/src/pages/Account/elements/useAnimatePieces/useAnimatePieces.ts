import type { PostgrestMaybeSingleResponse } from '@supabase/supabase-js';
import { supabase } from '../../../../supabase';
import { useUserFetch } from '../../../../shared/useUserFetch/useUserFetch';
import type { AnimatePiecesSetting } from '../AnimatePiecesSetting/AnimatePiecesSetting';

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

const fetchSetting = () =>
  supabase.from('profiles').select().maybeSingle().then(settingFrom);

export function useAnimatePieces(): AnimatePiecesSetting {
  return useUserFetch(fetchSetting).value ?? LOADING;
}
