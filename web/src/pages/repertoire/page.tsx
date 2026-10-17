import { CreateFolderForm } from './elements/CreateFolderForm/CreateFolderForm';
import { RepertoireList } from './elements/RepertoireList/RepertoireList';
import { useRepertoire } from './elements/useRepertoire/useRepertoire';
import './page.css';

export function Repertoire() {
  const { response, refresh } = useRepertoire();

  return (
    <section className="repertoire">
      <h1>Repertoire</h1>
      <CreateFolderForm onCreated={refresh} />
      <RepertoireList response={response} />
    </section>
  );
}
