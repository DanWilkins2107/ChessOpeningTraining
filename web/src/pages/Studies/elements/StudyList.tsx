import { ErrorMessage } from '../../../elements/ErrorMessage';
import type { StudiesResponse } from './useStudies';
import './StudyList.css';

export function StudyList({
  response,
}: {
  response: StudiesResponse | undefined;
}) {
  if (response === undefined) {
    return (
      <div
        role="status"
        aria-label="Loading studies"
        className="study-list-spinner"
      />
    );
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
        <li key={id} className="study-list-item">
          <span className="study-list-name">{name}</span>
          <span className="study-list-side">{side}</span>
        </li>
      ))}
    </ul>
  );
}
