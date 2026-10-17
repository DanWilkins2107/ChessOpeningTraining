import { CreateFolderForm } from './elements/CreateFolderForm/CreateFolderForm';
import { FolderList } from './elements/FolderList/FolderList';
import { useFolders } from './elements/useFolders/useFolders';
import './page.css';

export function Repertoire() {
  const { response, refresh } = useFolders();

  return (
    <section className="repertoire">
      <h1>Repertoire</h1>
      <CreateFolderForm onCreated={refresh} />
      <FolderList response={response} />
    </section>
  );
}
