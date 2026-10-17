import { LoadBoundary } from '../../../../../shared/LoadBoundary/LoadBoundary';
import { useUser } from '../../../../../shared/useUser/useUser';
import { FolderContents } from '../FolderContents/FolderContents';
import { FolderLoadError } from '../FolderLoadError/FolderLoadError';
import { FolderLoading } from '../FolderLoading/FolderLoading';

export function FolderDetails({ folderId }: { folderId: string }) {
  const userId = useUser()?.id;

  if (userId === undefined) return <FolderLoading />;

  return (
    <LoadBoundary
      key={folderId}
      Loading={FolderLoading}
      LoadError={FolderLoadError}
    >
      <FolderContents userId={userId} folderId={folderId} />
    </LoadBoundary>
  );
}
