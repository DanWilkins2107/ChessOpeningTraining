import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { Spinner } from '../../../../shared/Spinner/Spinner';
import { FolderItem } from '../FolderItem/FolderItem';
import { MoveTreeItem } from '../MoveTreeItem/MoveTreeItem';
import type { RepertoireResponse } from '../RepertoireResponse/RepertoireResponse';
import './RepertoireList.css';

export function RepertoireList({
  response,
}: {
  response: RepertoireResponse | undefined;
}) {
  if (response === undefined) {
    return <Spinner label="Loading repertoire" />;
  }

  const { folders, moveTrees } = response;

  if (folders.error || moveTrees.error) {
    return (
      <ErrorMessage>Couldn't load your repertoire, try again</ErrorMessage>
    );
  }

  if (folders.data.length === 0 && moveTrees.data.length === 0) {
    return (
      <p className="repertoire-list-empty">No folders or move trees yet</p>
    );
  }

  const inFolder = (folderId: string | null) =>
    moveTrees.data.filter((moveTree) => moveTree.folder_id === folderId);

  return (
    <ul className="repertoire-list">
      {folders.data.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          moveTrees={inFolder(folder.id)}
        />
      ))}
      {inFolder(null).map((moveTree) => (
        <MoveTreeItem key={moveTree.id} moveTree={moveTree} />
      ))}
    </ul>
  );
}
