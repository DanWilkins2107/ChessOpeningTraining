import { FolderNotFound } from '../FolderNotFound/FolderNotFound';
import { MoveTreeList } from '../MoveTreeList/MoveTreeList';
import { useFolder } from '../useFolder/useFolder';

type FolderContentsProps = { userId: string; folderId: string };

export function FolderContents({ userId, folderId }: FolderContentsProps) {
  const folder = useFolder(userId, folderId);

  if (folder === null) return <FolderNotFound />;

  return (
    <>
      <h1>{folder.name}</h1>
      <MoveTreeList moveTrees={folder.move_trees} />
    </>
  );
}
