import { use } from 'react';
import { CreateMoveTreeForm } from '../CreateMoveTreeForm/CreateMoveTreeForm';
import type { FolderResponse } from '../FolderResponse/FolderResponse';
import './MoveTreeList.css';

type MoveTreeListProps = {
  folderId: string;
  folder: Promise<FolderResponse>;
  onCreated: () => void;
};

export function MoveTreeList({
  folderId,
  folder,
  onCreated,
}: MoveTreeListProps) {
  const { data } = use(folder);

  if (data === null) return null;

  return (
    <>
      <CreateMoveTreeForm folderId={folderId} onCreated={onCreated} />
      {data.move_trees.length === 0 ? (
        <p className="move-tree-list-empty">No move trees yet</p>
      ) : (
        <ul aria-label="Move trees" className="move-tree-list">
          {data.move_trees.map(({ id, name }) => (
            <li key={id} className="move-tree-list-item">
              {name}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
