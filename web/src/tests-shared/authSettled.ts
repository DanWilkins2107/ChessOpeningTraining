import { act } from '@testing-library/react';
import { supabase } from '../supabase';

// supabase-js emits each subscription's first event in subscription order, so
// this one's arrives after the query client's. The client hands the user to
// components on a zero-delay timeout, so this waits one out after it.
export const authSettled = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        const { data } = supabase.auth.onAuthStateChange((event) => {
          if (event !== 'INITIAL_SESSION') return;
          data.subscription.unsubscribe();
          setTimeout(resolve);
        });
      }),
  );
