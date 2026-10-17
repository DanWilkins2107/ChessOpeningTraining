import { Link, generatePath } from 'react-router-dom';
import { FOLDER_ROUTE_PATH } from '../../router.constants';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { Spinner } from '../../../../shared/Spinner/Spinner';
import type { RepertoireResponse } from '../RepertoireResponse/RepertoireResponse';
import './RepertoireList.css';

export function RepertoireList({
  response,
}: {
  response: RepertoireResponse | undefined;
}) {
  if (response === undefined) {
    return <Spinner label="Loading repertoire" />;
  }

  const { folders, moveTrees } = response;

  if (folders.error || moveTrees.error) {
    return (
      <ErrorMessage>Couldn't load your repertoire, try again</ErrorMessage>
    );
  }

  if (folders.data.length === 0 && moveTrees.data.length === 0) {
    return (
      <p className="repertoire-list-empty">No folders or move trees yet</p>
    );
  }

  return (
    <ul className="repertoire-list">
      {folders.data.map(({ id, name }) => (
        <li key={id}>
          <Link
            to={generatePath(FOLDER_ROUTE_PATH, { folderId: id })}
            className="repertoire-list-item repertoire-list-folder"
          >
            <span className="repertoire-list-name">{name}</span>
          </Link>
        </li>
      ))}
      {moveTrees.data.map(({ id, name, side }) => (
        <li key={id} className="repertoire-list-item">
          <span className="repertoire-list-name">{name}</span>
          <span className="repertoire-list-side" data-side={side}>
            {side}
          </span>
        </li>
      ))}
    </ul>
  );
}
