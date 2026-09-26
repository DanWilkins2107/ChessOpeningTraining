import { ErrorMessage } from '../../../elements/ErrorMessage';
import type { Study } from './useStudies';
import './StudyList.css';

type StudyListProps = {
  studies: Study[] | undefined;
  failed: boolean;
};

export function StudyList({ studies, failed }: StudyListProps) {
  if (failed) {
    return <ErrorMessage>Couldn't load your studies, try again</ErrorMessage>;
  }

  if (studies === undefined) {
    return (
      <div
        role="status"
        aria-label="Loading studies"
        className="study-list-spinner"
      />
    );
  }

  if (studies.length === 0) {
    return <p className="study-list-empty">No studies yet</p>;
  }

  return (
    <ul className="study-list">
      {studies.map(({ id, name, side }) => (
        <li key={id} className="study-list-item">
          <span className="study-list-name">{name}</span>
          <span className="study-list-side">{side}</span>
        </li>
      ))}
    </ul>
  );
}
