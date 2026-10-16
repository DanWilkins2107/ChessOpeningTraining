import type { PostgrestMaybeSingleResponse } from '@supabase/supabase-js';
import { useSuspenseQuery } from '@tanstack/react-query';
import { supabase } from '../../../../supabase';
import { ANIMATE_PIECES_QUERY_KEY } from './useAnimatePieces.constants';

type ProfileResponse = PostgrestMaybeSingleResponse<{
  animate_pieces: boolean;
}>;

// A user without a profiles row has never saved the setting, so they get the
// column's default.
async function fetchSetting() {
  const { data, error }: ProfileResponse = await supabase
    .from('profiles')
    .select()
    .maybeSingle();
  if (error) throw error;
  return data?.animate_pieces ?? true;
}

export const useAnimatePieces = (userId: string) =>
  useSuspenseQuery({
    queryKey: [ANIMATE_PIECES_QUERY_KEY, userId],
    queryFn: fetchSetting,
  });
