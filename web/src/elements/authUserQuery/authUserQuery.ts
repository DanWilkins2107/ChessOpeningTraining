import { queryOptions } from '@tanstack/react-query';
import { supabase } from '../../supabase';
import { AUTH_USER_QUERY_KEY } from './authUserQuery.constants';

// getSession waits for the client to finish loading the stored session, and a
// session that cannot be refreshed comes back as null: signed out.
const fetchAuthUser = async () =>
  (await supabase.auth.getSession()).data.session?.user ?? null;

export const authUserQuery = queryOptions({
  queryKey: [AUTH_USER_QUERY_KEY],
  queryFn: fetchAuthUser,
  staleTime: Infinity,
});
