import { useMemo } from 'react';
import { useUser } from '../../../../shared/useUser/useUser';
import { supabase } from '../../../../supabase';
import type { StudyResponse } from '../StudyResponse/StudyResponse';

export function useStudy(studyId: string) {
  const userId = useUser()?.id;

  return useMemo(
    () => (userId === undefined ? undefined : fetchStudy(studyId)),
    [userId, studyId],
  );
}

async function fetchStudy(studyId: string): Promise<StudyResponse> {
  return supabase
    .from('studies')
    .select('name')
    .eq('id', studyId)
    .maybeSingle();
}
