import { use } from 'react';
import { Link, generatePath } from 'react-router-dom';
import { MOVE_TREE_ROUTE_PATH } from '../../../../MoveTree/router.constants';
import type { FolderResponse } from '../FolderResponse/FolderResponse';
import './MoveTreeList.css';

export function MoveTreeList({ folder }: { folder: Promise<FolderResponse> }) {
  const { data } = use(folder);

  if (data === null) return null;

  if (data.move_trees.length === 0) {
    return <p className="move-tree-list-empty">No move trees yet</p>;
  }

  return (
    <ul aria-label="Move trees" className="move-tree-list">
      {data.move_trees.map(({ id, name }) => (
        <li key={id}>
          <Link
            to={generatePath(MOVE_TREE_ROUTE_PATH, { moveTreeId: id })}
            className="move-tree-list-item"
          >
            {name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
