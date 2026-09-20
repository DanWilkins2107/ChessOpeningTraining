import type { PostgrestResponse } from '@supabase/supabase-js';
import { useEffect, useEffectEvent, useState } from 'react';
import { useUser } from '../../../elements/session';
import { supabase } from '../../../supabase';

export type Study = {
  id: string;
  name: string;
  side: 'white' | 'black';
};

export type StudiesResponse = PostgrestResponse<Study>;

export function useStudies() {
  const userId = useUser()?.id;
  // A fresh object per refresh: the effect has no use for it beyond re-running.
  const [request, setRequest] = useState({});
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
  }, [userId, request]);

  return {
    response: loaded.userId === userId ? loaded.response : undefined,
    refresh: () => setRequest({}),
  };
}
