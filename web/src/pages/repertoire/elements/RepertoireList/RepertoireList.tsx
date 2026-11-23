import { CreateFolderForm } from '../CreateFolderForm/CreateFolderForm';
import { EmptyRepertoire } from '../EmptyRepertoire/EmptyRepertoire';
import { FolderItem } from '../FolderItem/FolderItem';
import { MoveTreeItem } from '../MoveTreeItem/MoveTreeItem';
import { RepertoireCard } from '../RepertoireCard/RepertoireCard';
import { useNamingRow } from '../useNamingRow/useNamingRow';
import { useRepertoire } from '../useRepertoire/useRepertoire';
import './RepertoireList.css';

export function RepertoireList() {
  const repertoire = useRepertoire();
  const { naming, closed, opener, open, toggle, close } = useNamingRow();
  const folders = repertoire.folders.filter(
    (folder) => folder.parent_id === null,
  );
  const moveTrees = repertoire.move_trees.filter(
    (moveTree) => moveTree.folder_id === null,
  );
  const empty = folders.length === 0 && moveTrees.length === 0;

  async function folderCreated() {
    await repertoire.refetch();
    close();
  }

  if (empty && !naming) {
    return <EmptyRepertoire onCreateFolder={open} focusCreate={closed} />;
  }

  return (
    <>
      {!empty && (
        <button
          type="button"
          ref={opener}
          className="repertoire-list-new-folder"
          aria-expanded={naming}
          onClick={toggle}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New folder
        </button>
      )}
      <RepertoireCard>
        <ul className="repertoire-list">
          {naming && (
            <li>
              <CreateFolderForm onCreated={folderCreated} onCancel={close} />
            </li>
          )}
          {folders.map((folder) => (
            <FolderItem key={folder.id} folder={folder} />
          ))}
          {moveTrees.map((moveTree) => (
            <MoveTreeItem key={moveTree.id} moveTree={moveTree} />
          ))}
        </ul>
      </RepertoireCard>
    </>
  );
}
