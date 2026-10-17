import type { User } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';
import { authUserQuery } from '../../elements/authUserQuery/authUserQuery';

export function useUser(): User | null | undefined {
  return useQuery(authUserQuery).data;
}
