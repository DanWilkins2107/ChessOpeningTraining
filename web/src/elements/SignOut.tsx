import type { AuthError } from '@supabase/supabase-js';
import { Suspense, useState } from 'react';
import { supabase } from '../supabase';
import { useUser } from './session';
import './SignOut.css';

// TODO 4218fc7e 2026-10-13: once useUser() returns undefined while loading instead of suspending, drop this Suspense wrapper and merge SignOutButton back into SignOut
export function SignOut() {
  return (
    <Suspense>
      <SignOutButton />
    </Suspense>
  );
}

function SignOutButton() {
  const user = useUser();
  const [error, setError] = useState<AuthError | null>(null);

  async function signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    setError(error);
  }

  if (user) {
    return (
      <button type="button" className="sign-out" onClick={signOut}>
        Sign out
      </button>
    );
  }

  return (
    error && (
      <p role="alert" className="sign-out-error">
        {error.message}
      </p>
    )
  );
}
