import { CreateStudyForm } from './elements/CreateStudyForm';
import { StudyList } from './elements/StudyList';
import { useStudies } from './elements/useStudies';
import './page.css';

export function Studies() {
  const { data, isError } = useStudies();

  return (
    <section className="studies">
      <h1>Studies</h1>
      <CreateStudyForm />
      <StudyList studies={data} failed={isError} />
    </section>
  );
}
