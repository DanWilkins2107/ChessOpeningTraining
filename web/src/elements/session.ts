import type { Session, User } from '@supabase/supabase-js';
import { use, useEffect, useEffectEvent, useState } from 'react';
import { supabase } from '../supabase';

const startupUser = supabase.auth.getSession().then(({ data, error }) => {
  if (error) throw error;
  return data.session?.user ?? null;
});

export function useUser(): User | null {
  const [user, setUser] = useState(use(startupUser));
  const onAuthChange = useEffectEvent((session: Session | null) =>
    setUser(session?.user ?? null),
  );

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      onAuthChange(session),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  return user;
}
