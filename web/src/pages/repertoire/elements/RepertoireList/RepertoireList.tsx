import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { CreateFolderForm } from '../CreateFolderForm/CreateFolderForm';
import { EmptyRepertoire } from '../EmptyRepertoire/EmptyRepertoire';
import { FolderItem } from '../FolderItem/FolderItem';
import { MoveTreeItem } from '../MoveTreeItem/MoveTreeItem';
import { RepertoireCard } from '../RepertoireCard/RepertoireCard';
import { useRepertoire } from '../useRepertoire/useRepertoire';
import { REPERTOIRE_QUERY_KEY } from '../useRepertoire/useRepertoire.constants';
import './RepertoireList.css';

export function RepertoireList() {
  const repertoire = useRepertoire();
  const queryClient = useQueryClient();
  const [naming, setNaming] = useState(false);
  // Set once the naming row has closed, so focus returns to what opened it
  // rather than falling to the page.
  const [closedNaming, setClosedNaming] = useState(false);
  const newFolder = useRef<HTMLButtonElement>(null);
  const folders = repertoire.folders.filter(
    (folder) => folder.parent_id === null,
  );
  const moveTrees = repertoire.move_trees.filter(
    (moveTree) => moveTree.folder_id === null,
  );
  const empty = folders.length === 0 && moveTrees.length === 0;

  useEffect(() => {
    if (closedNaming && !naming) newFolder.current?.focus();
  }, [closedNaming, naming]);

  function closeNaming() {
    setNaming(false);
    setClosedNaming(true);
  }

  async function folderCreated() {
    await queryClient.invalidateQueries({ queryKey: [REPERTOIRE_QUERY_KEY] });
    closeNaming();
  }

  if (empty && !naming) {
    return (
      <EmptyRepertoire
        onCreateFolder={() => setNaming(true)}
        focusCreate={closedNaming}
      />
    );
  }

  return (
    <>
      {!empty && (
        <button
          type="button"
          ref={newFolder}
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
      <RepertoireCard>
        <ul className="repertoire-list">
          {naming && (
            <li>
              <CreateFolderForm
                onCreated={folderCreated}
                onCancel={closeNaming}
              />
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
