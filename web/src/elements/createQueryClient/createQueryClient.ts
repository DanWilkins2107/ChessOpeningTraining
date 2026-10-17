import { QueryClient } from '@tanstack/react-query';
import { supabase } from '../../supabase';
import { authUserQuery } from '../authUserQuery/authUserQuery';
import { QUERY_CLIENT_DEFAULT_OPTIONS } from './createQueryClient.constants';

export function createQueryClient() {
  const client = new QueryClient({
    defaultOptions: QUERY_CLIENT_DEFAULT_OPTIONS,
  });
  supabase.auth.onAuthStateChange((_event, session) =>
    client.setQueryData(authUserQuery.queryKey, session?.user ?? null),
  );
  return client;
}
