import { useParams } from 'react-router-dom';
import { StudyHeader } from './elements/StudyHeader/StudyHeader';
import { useStudy } from './elements/useStudy/useStudy';

export function Study() {
  const { studyId } = useParams() as { studyId: string };
  const response = useStudy(studyId);

  return (
    <section aria-label="Study">
      <StudyHeader response={response} />
    </section>
  );
}
