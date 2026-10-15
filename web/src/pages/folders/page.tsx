import { CreateFolderForm } from './elements/CreateFolderForm/CreateFolderForm';
import { FolderList } from './elements/FolderList/FolderList';
import { useFolders } from './elements/useFolders/useFolders';
import './page.css';

export function Folders() {
  const { response, refresh } = useFolders();

  return (
    <section className="folders">
      <h1>Folders</h1>
      <CreateFolderForm onCreated={refresh} />
      <FolderList response={response} />
    </section>
  );
}
