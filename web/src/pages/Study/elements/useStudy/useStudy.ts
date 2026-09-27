import { useMemo } from 'react';
import { useUser } from '../../../../shared/useUser/useUser';
import { supabase } from '../../../../supabase';

export function useStudy(studyId: string) {
  const userId = useUser()?.id;

  return useMemo(
    () => (userId === undefined ? undefined : fetchStudy(studyId)),
    [userId, studyId],
  );
}

async function fetchStudy(studyId: string) {
  const { data } = await supabase
    .from('studies')
    .select('name')
    .eq('id', studyId)
    .maybeSingle()
    .throwOnError();
  return data;
}
