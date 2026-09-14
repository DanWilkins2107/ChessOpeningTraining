import { act } from '@testing-library/react';
import { supabase } from '../src/supabase';

// supabase-js emits each subscription's first event in subscription order, so
// this one's arrives after the rendered component's.
export const authSettled = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        const { data } = supabase.auth.onAuthStateChange((event) => {
          if (event !== 'INITIAL_SESSION') return;
          data.subscription.unsubscribe();
          resolve();
        });
      }),
  );
