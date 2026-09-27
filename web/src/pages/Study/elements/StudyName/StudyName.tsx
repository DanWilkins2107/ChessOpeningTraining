import { use } from 'react';
import { StudyLoadError } from '../StudyLoadError/StudyLoadError';
import { StudyNotFound } from '../StudyNotFound/StudyNotFound';
import type { StudyResponse } from '../StudyResponse/StudyResponse';

export function StudyName({ study }: { study: Promise<StudyResponse> }) {
  const { data, error } = use(study);

  if (error !== null) return <StudyLoadError />;
  if (data === null) return <StudyNotFound />;

  return <h1>{data.name}</h1>;
}
