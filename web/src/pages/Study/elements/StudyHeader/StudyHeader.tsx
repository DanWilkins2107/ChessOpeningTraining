import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { StudyLoadError } from '../StudyLoadError/StudyLoadError';
import { StudyLoading } from '../StudyLoading/StudyLoading';
import { StudyName } from '../StudyName/StudyName';
import { useStudy } from '../useStudy/useStudy';

export function StudyHeader({ studyId }: { studyId: string }) {
  const study = useStudy(studyId);

  if (study === undefined) return <StudyLoading />;

  return (
    <ErrorBoundary key={studyId} fallback={<StudyLoadError />}>
      <Suspense fallback={<StudyLoading />}>
        <StudyName study={study} />
      </Suspense>
    </ErrorBoundary>
  );
}
