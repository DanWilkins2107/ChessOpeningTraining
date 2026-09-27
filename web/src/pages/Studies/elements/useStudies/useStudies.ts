import { useUserFetch } from '../useUserFetch/useUserFetch';
import { supabase } from '../../../../supabase';
import type { StudiesResponse } from '../StudiesResponse/StudiesResponse';

const fetchStudies = (): PromiseLike<StudiesResponse> =>
  supabase
    .from('studies')
    .select('id, name, side')
    .order('created_at', { ascending: false });

export function useStudies() {
  const { value, refresh } = useUserFetch(fetchStudies);
  return { response: value, refresh };
}
