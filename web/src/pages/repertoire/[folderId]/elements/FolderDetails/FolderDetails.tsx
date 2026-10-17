import { Suspense } from 'react';
import { MoveTreeList } from '../MoveTreeList/MoveTreeList';
import { FolderLoading } from '../FolderLoading/FolderLoading';
import { FolderName } from '../FolderName/FolderName';
import { useFolder } from '../useFolder/useFolder';

export function FolderDetails({ folderId }: { folderId: string }) {
  const { folder, refresh } = useFolder(folderId);

  if (folder === undefined) return <FolderLoading />;

  return (
    <Suspense key={folderId} fallback={<FolderLoading />}>
      <FolderName folder={folder} />
      <MoveTreeList folderId={folderId} folder={folder} onCreated={refresh} />
    </Suspense>
  );
}
