import { Suspense } from 'react';
import { ChapterList } from '../ChapterList/ChapterList';
import { StudyLoading } from '../StudyLoading/StudyLoading';
import { StudyName } from '../StudyName/StudyName';
import { useStudy } from '../useStudy/useStudy';

export function StudyDetails({ studyId }: { studyId: string }) {
  const study = useStudy(studyId);

  if (study === undefined) return <StudyLoading />;

  return (
    <Suspense key={studyId} fallback={<StudyLoading />}>
      <StudyName study={study} />
      <ChapterList study={study} />
    </Suspense>
  );
}
