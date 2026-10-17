import { useQueryClient } from '@tanstack/react-query';
import { LoadBoundary } from '../../shared/LoadBoundary/LoadBoundary';
import { useUser } from '../../shared/useUser/useUser';
import { CreateFolderForm } from './elements/CreateFolderForm/CreateFolderForm';
import { FolderList } from './elements/FolderList/FolderList';
import { FoldersLoadError } from './elements/FoldersLoadError/FoldersLoadError';
import { FoldersLoading } from './elements/FoldersLoading/FoldersLoading';
import { FOLDERS_QUERY_KEY } from './elements/useFolders/useFolders.constants';
import './page.css';

export function Repertoire() {
  const userId = useUser()?.id;
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: [FOLDERS_QUERY_KEY] });

  return (
    <section className="repertoire">
      <h1>Repertoire</h1>
      <CreateFolderForm onCreated={refresh} />
      {userId === undefined ? (
        <FoldersLoading />
      ) : (
        <LoadBoundary Loading={FoldersLoading} LoadError={FoldersLoadError}>
          <FolderList userId={userId} />
        </LoadBoundary>
      )}
    </section>
  );
}
