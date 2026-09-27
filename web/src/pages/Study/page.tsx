import { useParams } from 'react-router-dom';
import { z } from '../../z';
import { StudyDetails } from './elements/StudyDetails/StudyDetails';
import { StudyLoadError } from './elements/StudyLoadError/StudyLoadError';
import './page.css';

const paramsSchema = z.object({ studyId: z.uuid() });

export function Study() {
  const params = paramsSchema.safeParse(useParams());

  return (
    <section aria-label="Study" className="study">
      {params.success ? (
        <StudyDetails studyId={params.data.studyId} />
      ) : (
        <StudyLoadError />
      )}
    </section>
  );
}
