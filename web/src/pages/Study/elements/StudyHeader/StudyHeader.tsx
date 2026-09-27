import { Suspense } from 'react';
import { StudyLoading } from '../StudyLoading/StudyLoading';
import { StudyName } from '../StudyName/StudyName';
import { useStudy } from '../useStudy/useStudy';

export function StudyHeader({ studyId }: { studyId: string }) {
  const study = useStudy(studyId);

  if (study === undefined) return <StudyLoading />;

  // Keyed so moving to another study shows the fallback, rather than the
  // router's transition keeping the previous study on screen.
  return (
    <Suspense key={studyId} fallback={<StudyLoading />}>
      <StudyName study={study} />
    </Suspense>
  );
}
