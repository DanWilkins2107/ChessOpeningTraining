import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { CreateFolderForm } from '../CreateFolderForm/CreateFolderForm';
import { EmptyRepertoire } from '../EmptyRepertoire/EmptyRepertoire';
import { FolderItem } from '../FolderItem/FolderItem';
import { MoveTreeItem } from '../MoveTreeItem/MoveTreeItem';
import { useRepertoire } from '../useRepertoire/useRepertoire';
import { REPERTOIRE_QUERY_KEY } from '../useRepertoire/useRepertoire.constants';
import './RepertoireList.css';

export function RepertoireList() {
  const repertoire = useRepertoire();
  const queryClient = useQueryClient();
  const [naming, setNaming] = useState(false);
  const folders = repertoire.folders.filter(
    (folder) => folder.parent_id === null,
  );
  const moveTrees = repertoire.move_trees.filter(
    (moveTree) => moveTree.folder_id === null,
  );
  const empty = folders.length === 0 && moveTrees.length === 0;

  function folderCreated() {
    setNaming(false);
    void queryClient.invalidateQueries({ queryKey: [REPERTOIRE_QUERY_KEY] });
  }

  if (empty && !naming) {
    return <EmptyRepertoire onCreateFolder={() => setNaming(true)} />;
  }

  return (
    <>
      {!empty && (
        <button
          type="button"
          className="repertoire-list-new-folder"
          aria-expanded={naming}
          onClick={() => setNaming(!naming)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New folder
        </button>
      )}
      <ul className="repertoire-list">
        {naming && (
          <li>
            <CreateFolderForm onCreated={folderCreated} />
          </li>
        )}
        {folders.map((folder) => (
          <FolderItem key={folder.id} folder={folder} />
        ))}
        {moveTrees.map((moveTree) => (
          <MoveTreeItem key={moveTree.id} moveTree={moveTree} />
        ))}
      </ul>
    </>
  );
}
