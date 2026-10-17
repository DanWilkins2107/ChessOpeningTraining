import { use } from 'react';
import { generatePath } from 'react-router-dom';
import { MOVE_TREE_ROUTE_PATH } from '../../../../MoveTree/router.constants';
import { RowLink } from '../RowLink/RowLink';
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
          <RowLink to={generatePath(MOVE_TREE_ROUTE_PATH, { moveTreeId: id })}>
            {name}
          </RowLink>
        </li>
      ))}
    </ul>
  );
}
