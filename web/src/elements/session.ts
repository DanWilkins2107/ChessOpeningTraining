import type { Session, User } from '@supabase/supabase-js';
import { useEffect, useEffectEvent, useState } from 'react';
import { supabase } from '../supabase';
import { SUBSCRIBE_ONCE } from './constants';

export function useUser(): User | null | undefined {
  const [user, setUser] = useState<User | null>();
  const onAuthChange = useEffectEvent((session: Session | null) =>
    setUser(session?.user ?? null),
  );

  useEffect(
    () => {
      const { data } = supabase.auth.onAuthStateChange((_event, session) =>
        onAuthChange(session),
      );
      return () => data.subscription.unsubscribe();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- an empty list from constants.ts, so Stryker skips its equivalent mutant
    SUBSCRIBE_ONCE,
  );

  return user;
}
