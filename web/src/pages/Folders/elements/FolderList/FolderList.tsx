import { Link, generatePath } from 'react-router-dom';
import { FOLDER_ROUTE_PATH } from '../../../../shared/routes/routes.constants';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { Spinner } from '../../../../shared/Spinner/Spinner';
import type { FoldersResponse } from '../FoldersResponse/FoldersResponse';
import './FolderList.css';

export function FolderList({
  response,
}: {
  response: FoldersResponse | undefined;
}) {
  if (response === undefined) {
    return <Spinner label="Loading folders" />;
  }

  if (response.error) {
    return <ErrorMessage>Couldn't load your folders, try again</ErrorMessage>;
  }

  if (response.data.length === 0) {
    return <p className="folder-list-empty">No folders yet</p>;
  }

  return (
    <ul className="folder-list">
      {response.data.map(({ id, name, side }) => (
        <li key={id}>
          <Link
            to={generatePath(FOLDER_ROUTE_PATH, { folderId: id })}
            aria-label={name}
            className="folder-list-item"
          >
            <span className="folder-list-name">{name}</span>
            <span className="folder-list-side">{side}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
