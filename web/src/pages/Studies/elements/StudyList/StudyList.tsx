import { Link, generatePath } from 'react-router-dom';
import { STUDY_ROUTE_PATH } from '../../../../shared/routes/routes.constants';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { Spinner } from '../../../../shared/Spinner/Spinner';
import type { StudiesResponse } from '../StudiesResponse/StudiesResponse';
import './StudyList.css';

export function StudyList({
  response,
}: {
  response: StudiesResponse | undefined;
}) {
  if (response === undefined) {
    return <Spinner label="Loading studies" />;
  }

  if (response.error) {
    return <ErrorMessage>Couldn't load your studies, try again</ErrorMessage>;
  }

  if (response.data.length === 0) {
    return <p className="study-list-empty">No studies yet</p>;
  }

  return (
    <ul className="study-list">
      {response.data.map(({ id, name, side }) => (
        <li key={id}>
          <Link
            to={generatePath(STUDY_ROUTE_PATH, { studyId: id })}
            aria-label={name}
            className="study-list-item"
          >
            <span className="study-list-name">{name}</span>
            <span className="study-list-side">{side}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
