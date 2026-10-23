import type { PostgrestMaybeSingleResponse } from '@supabase/supabase-js';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useAuthenticatedUser } from '../../../../shared/useAuthenticatedUser/useAuthenticatedUser';
import { supabase } from '../../../../supabase';
import {
  PROFILE_SETTINGS_QUERY_KEY,
  type ProfileSetting,
} from './useProfileSettings.constants';

export type UseProfileSettings = Record<ProfileSetting, boolean>;

// A user without a profiles row has never saved a setting, so they get the
// columns' defaults.
const DEFAULTS: UseProfileSettings = {
  animate_pieces: true,
  show_move_hints: true,
};

async function fetchSettings() {
  const { data, error }: PostgrestMaybeSingleResponse<UseProfileSettings> =
    await supabase
      .from('profiles')
      .select('animate_pieces, show_move_hints')
      .maybeSingle();
  if (error) throw error;
  return data ?? DEFAULTS;
}

export function useProfileSettings() {
  const userId = useAuthenticatedUser().id;
  return useSuspenseQuery({
    queryKey: [PROFILE_SETTINGS_QUERY_KEY, userId],
    queryFn: fetchSettings,
  });
}
