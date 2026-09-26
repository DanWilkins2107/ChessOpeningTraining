import { useEffect, useEffectEvent, useState } from 'react';
import { useUser } from '../../../../shared/useUser/useUser';
import { supabase } from '../../../../supabase';
import type { StudyResponse } from '../StudyResponse/StudyResponse';

export function useStudy(studyId: string) {
  const userId = useUser()?.id;
  const [loaded, setLoaded] = useState<{
    userId?: string;
    studyId?: string;
    response?: StudyResponse;
  }>({});

  // Reads the user and study of the moment the response lands, so one for a
  // user or study since changed is dropped (see useStudies).
  const onResponse = useEffectEvent(
    (forUser: string, forStudy: string, response: StudyResponse) => {
      if (forUser === userId && forStudy === studyId) {
        setLoaded({ userId, studyId, response });
      }
    },
  );

  useEffect(() => {
    if (userId === undefined) return;

    supabase
      .from('studies')
      .select('name')
      .eq('id', studyId)
      .maybeSingle()
      .then((response) => onResponse(userId, studyId, response));
  }, [userId, studyId]);

  return loaded.userId === userId && loaded.studyId === studyId
    ? loaded.response
    : undefined;
}
