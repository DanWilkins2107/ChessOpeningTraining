import type { PostgrestSingleResponse } from '@supabase/supabase-js';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useAuthenticatedUser } from '../../../../shared/useAuthenticatedUser/useAuthenticatedUser';
import { supabase } from '../../../../supabase';
import type { RepertoireFolder } from '../RepertoireFolder/RepertoireFolder';
import type { RepertoireMoveTree } from '../RepertoireMoveTree/RepertoireMoveTree';
import { REPERTOIRE_QUERY_KEY } from './useRepertoire.constants';

type RepertoireResponse = PostgrestSingleResponse<{
  folders: RepertoireFolder[];
  move_trees: RepertoireMoveTree[];
}>;

async function fetchRepertoire() {
  const { data, error }: RepertoireResponse =
    await supabase.rpc('get_repertoire');
  if (error) throw error;
  return data;
}

export function useRepertoire() {
  const userId = useAuthenticatedUser().id;
  return useSuspenseQuery({
    queryKey: [REPERTOIRE_QUERY_KEY, userId],
    queryFn: fetchRepertoire,
  }).data;
}
