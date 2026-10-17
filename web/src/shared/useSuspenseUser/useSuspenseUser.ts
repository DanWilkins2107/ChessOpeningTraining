// fallow-ignore-file unused-file -- ed293461 2026-11-16 landed ahead of the load-moves hook, its first consumer.
import type { User } from '@supabase/supabase-js';
import { useSuspenseQuery } from '@tanstack/react-query';
import { authUserQuery } from '../../elements/authUserQuery/authUserQuery';

export function useSuspenseUser(): User {
  const { data } = useSuspenseQuery(authUserQuery);
  if (data === null) throw new Error('useSuspenseUser needs a signed-in user');
  return data;
}
