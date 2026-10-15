import { Link, generatePath } from 'react-router-dom';
import { FOLDER_ROUTE_PATH } from '../../router.constants';
import { useFolders } from '../useFolders/useFolders';
import './FolderList.css';

export function FolderList({ userId }: { userId: string }) {
  const folders = useFolders(userId);

  if (folders.length === 0) {
    return <p className="folder-list-empty">No folders yet</p>;
  }

  return (
    <ul className="folder-list">
      {folders.map(({ id, name }) => (
        <li key={id}>
          <Link
            to={generatePath(FOLDER_ROUTE_PATH, { folderId: id })}
            className="folder-list-item"
          >
            <span className="folder-list-name">{name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
