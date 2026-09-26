import { CreateStudyForm } from './elements/CreateStudyForm/CreateStudyForm';
import { StudyList } from './elements/StudyList/StudyList';
import { useStudies } from './elements/useStudies/useStudies';
import './page.css';

export function Studies() {
  const { response, refresh } = useStudies();

  return (
    <section className="studies">
      <h1>Studies</h1>
      <CreateStudyForm onCreated={refresh} />
      <StudyList response={response} />
    </section>
  );
}
