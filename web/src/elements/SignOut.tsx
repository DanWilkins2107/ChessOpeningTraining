import type { AuthError } from '@supabase/supabase-js';
import { useState } from 'react';
import { supabase } from '../supabase';
import './SignOut.css';

export function SignOut({ showButton }: { showButton: boolean }) {
  const [error, setError] = useState<AuthError | null>(null);

  async function signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    setError(error);
  }

  if (showButton) {
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
