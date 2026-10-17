import { generatePath } from 'react-router-dom';
import { FOLDER_ROUTE_PATH } from '../../router.constants';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { Spinner } from '../../../../shared/Spinner/Spinner';
import { RowLink } from '../../shared/RowLink/RowLink';
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
      {response.data.map(({ id, name }) => (
        <li key={id}>
          <RowLink to={generatePath(FOLDER_ROUTE_PATH, { folderId: id })}>
            <span className="folder-list-name">{name}</span>
          </RowLink>
        </li>
      ))}
    </ul>
  );
}
