import { useParams } from 'react-router-dom';
import { z } from '../../z';
import { StudyHeader } from './elements/StudyHeader/StudyHeader';
import { StudyNotFound } from './elements/StudyNotFound/StudyNotFound';

const paramsSchema = z.object({ studyId: z.uuid() });

export function Study() {
  const params = paramsSchema.safeParse(useParams());

  return (
    <section aria-label="Study">
      {params.success ? (
        <StudyHeader studyId={params.data.studyId} />
      ) : (
        <StudyNotFound />
      )}
    </section>
  );
}
