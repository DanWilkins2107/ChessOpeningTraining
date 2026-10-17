// fallow-ignore-file unused-file -- ed293461 2026-11-16 reached only through useMoves, which landed ahead of the move tree page.
import type { User } from '@supabase/supabase-js';
import { useSuspenseQuery } from '@tanstack/react-query';
import { authUserQuery } from '../../elements/authUserQuery/authUserQuery';

export function useAuthenticatedUser(): User {
  const { data } = useSuspenseQuery(authUserQuery);
  if (data === null)
    throw new Error('useAuthenticatedUser needs a signed-in user');
  return data;
}
