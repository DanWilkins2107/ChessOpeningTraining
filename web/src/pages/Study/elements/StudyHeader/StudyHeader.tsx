import { Suspense } from 'react';
import { StudyLoading } from '../StudyLoading/StudyLoading';
import { StudyName } from '../StudyName/StudyName';
import { useStudy } from '../useStudy/useStudy';

export function StudyHeader({ studyId }: { studyId: string }) {
  const study = useStudy(studyId);

  if (study === undefined) return <StudyLoading />;

  return (
    <Suspense key={studyId} fallback={<StudyLoading />}>
      <StudyName study={study} />
    </Suspense>
  );
}
