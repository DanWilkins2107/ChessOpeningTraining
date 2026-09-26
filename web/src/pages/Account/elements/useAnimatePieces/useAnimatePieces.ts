import type { PostgrestMaybeSingleResponse } from '@supabase/supabase-js';
import { useEffect, useEffectEvent, useState } from 'react';
import { supabase } from '../../../../supabase';
import { useUser } from '../../../../shared/useUser/useUser';
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

export function useAnimatePieces(): AnimatePiecesSetting {
  const userId = useUser()?.id;
  const [loaded, setLoaded] = useState<{
    userId?: string;
    setting?: AnimatePiecesSetting;
  }>({});

  // Called from the response, not from the effect, so it reads the user of that
  // later moment and drops a response for a user who has since changed.
  const onResponse = useEffectEvent(
    (requestedFor: string, response: ProfileResponse) => {
      if (requestedFor === userId)
        setLoaded({ userId, setting: settingFrom(response) });
    },
  );

  useEffect(() => {
    if (userId === undefined) return;

    supabase
      .from('profiles')
      .select('animate_pieces')
      .maybeSingle()
      .then((response) => onResponse(userId, response));
  }, [userId]);

  return (loaded.userId === userId && loaded.setting) || LOADING;
}
