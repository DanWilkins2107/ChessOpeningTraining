import { use } from 'react';
import { StudyLoadError } from '../StudyLoadError/StudyLoadError';
import type { StudyResponse } from '../StudyResponse/StudyResponse';

export function StudyName({ study }: { study: Promise<StudyResponse> }) {
  const { data } = use(study);

  if (data === null) return <StudyLoadError />;

  return <h1>{data.name}</h1>;
}
