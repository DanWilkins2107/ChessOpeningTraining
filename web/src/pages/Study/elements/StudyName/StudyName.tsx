import { use } from 'react';
import { StudyLoadError } from '../StudyLoadError/StudyLoadError';

export function StudyName({
  study,
}: {
  study: Promise<{ name: string } | null>;
}) {
  const data = use(study);

  if (data === null) return <StudyLoadError />;

  return <h1>{data.name}</h1>;
}
