import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import type { StudyResponse } from '../StudyResponse/StudyResponse';
import './StudyHeader.css';

export function StudyHeader({
  response,
}: {
  response: StudyResponse | undefined;
}) {
  if (response === undefined) {
    return (
      <div
        role="status"
        aria-label="Loading study"
        className="study-header-spinner"
      />
    );
  }

  if (response.data === null) {
    return <ErrorMessage>Couldn't load this study, try again</ErrorMessage>;
  }

  return <h1>{response.data.name}</h1>;
}
