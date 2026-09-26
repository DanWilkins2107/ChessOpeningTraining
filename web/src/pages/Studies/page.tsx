import { StudyList } from './elements/StudyList/StudyList';
import { useStudies } from './elements/useStudies/useStudies';
import './page.css';

export function Studies() {
  const response = useStudies();

  return (
    <section className="studies">
      <h1>Studies</h1>
      <StudyList response={response} />
    </section>
  );
}
