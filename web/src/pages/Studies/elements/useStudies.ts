import type { PostgrestResponse } from '@supabase/supabase-js';
import { useEffect, useEffectEvent, useState } from 'react';
import { useUser } from '../../../elements/useUser';
import { supabase } from '../../../supabase';

export type Study = {
  id: string;
  name: string;
  side: 'white' | 'black';
};

export type StudiesResponse = PostgrestResponse<Study>;

export function useStudies(): StudiesResponse | undefined {
  const userId = useUser()?.id;
  const [loaded, setLoaded] = useState<{
    userId?: string;
    response?: StudiesResponse;
  }>({});

  // Called from the response, not from the effect, so it reads the user of that
  // later moment: a response for a user who has since changed is dropped here,
  // rather than by the effect carrying a flag its cleanup has to flip.
  const onResponse = useEffectEvent(
    (requestedFor: string, response: StudiesResponse) => {
      if (requestedFor === userId) setLoaded({ userId, response });
    },
  );

  useEffect(() => {
    if (userId === undefined) return;

    supabase
      .from('studies')
      .select('id, name, side')
      .order('created_at', { ascending: false })
      .then((response) => onResponse(userId, response));
  }, [userId]);

  return loaded.userId === userId ? loaded.response : undefined;
}
