import type { Session, User } from '@supabase/supabase-js';
import { use, useEffect, useEffectEvent, useState } from 'react';
import { supabase } from '../supabase';

const userFrom = (session: Session | null) => session?.user ?? null;

const startupUser = supabase.auth.getSession().then(({ data, error }) => {
  if (error) throw error;
  return userFrom(data.session);
});

export function useUser(): User | null {
  const [user, setUser] = useState(use(startupUser));
  const onAuthChange = useEffectEvent((session: Session | null) =>
    setUser(userFrom(session)),
  );

  // Stryker disable ArrayDeclaration: any constant dependency list subscribes
  // once just like [], so no test can tell the mutant apart.
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) =>
      onAuthChange(session),
    );
    return () => data.subscription.unsubscribe();
  }, []);
  // Stryker restore ArrayDeclaration

  return user;
}
