import { useQuery } from '@tanstack/react-query';
import { useUser } from '../../../elements/session';
import { supabase } from '../../../supabase';
import { STUDIES_QUERY_KEY } from './useStudies.constants';

export type Study = {
  id: string;
  name: string;
  side: 'white' | 'black';
};

async function fetchStudies(): Promise<Study[]> {
  const { data, error } = await supabase
    .from('studies')
    .select('id, name, side')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export function useStudies() {
  const userId = useUser()?.id;
  return useQuery({
    queryKey: [...STUDIES_QUERY_KEY, userId],
    queryFn: fetchStudies,
    enabled: userId !== undefined,
  });
}
