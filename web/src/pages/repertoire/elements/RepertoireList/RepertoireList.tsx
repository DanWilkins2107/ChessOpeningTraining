import { FolderItem } from '../FolderItem/FolderItem';
import { MoveTreeItem } from '../MoveTreeItem/MoveTreeItem';
import { useRepertoire } from '../useRepertoire/useRepertoire';
import './RepertoireList.css';

export function RepertoireList() {
  const repertoire = useRepertoire();
  const folders = repertoire.folders.filter(
    (folder) => folder.parent_id === null,
  );
  const moveTrees = repertoire.move_trees.filter(
    (moveTree) => moveTree.folder_id === null,
  );

  if (folders.length === 0 && moveTrees.length === 0) {
    return (
      <p className="repertoire-list-empty">No folders or move trees yet</p>
    );
  }

  return (
    <ul className="repertoire-list">
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
      {moveTrees.map((moveTree) => (
        <MoveTreeItem key={moveTree.id} moveTree={moveTree} />
      ))}
    </ul>
  );
}
