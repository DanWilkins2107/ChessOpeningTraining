import type { Session, User } from '@supabase/supabase-js';
import { use, useEffect, useEffectEvent, useState } from 'react';
import { supabase } from '../supabase';

export async function readUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user ?? null;
}

export const startupUser = readUser();

export function useUser(userRead: Promise<User | null>): User | null {
  const [user, setUser] = useState(use(userRead));
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
