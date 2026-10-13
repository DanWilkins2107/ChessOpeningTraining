import { Suspense } from 'react';
import { ChapterList } from '../ChapterList/ChapterList';
import { FolderLoading } from '../FolderLoading/FolderLoading';
import { FolderName } from '../FolderName/FolderName';
import { useFolder } from '../useFolder/useFolder';

export function FolderDetails({ folderId }: { folderId: string }) {
  const folder = useFolder(folderId);

  if (folder === undefined) return <FolderLoading />;

  return (
    <Suspense key={folderId} fallback={<FolderLoading />}>
      <FolderName folder={folder} />
      <ChapterList folder={folder} />
    </Suspense>
  );
}
