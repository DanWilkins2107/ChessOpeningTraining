import { Link, generatePath } from 'react-router-dom';
import { BRANCH_ROUTE_PATH } from '../../../../shared/routes/routes.constants';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { Spinner } from '../../../../shared/Spinner/Spinner';
import type { BranchesResponse } from '../BranchesResponse/BranchesResponse';
import './BranchList.css';

export function BranchList({
  response,
}: {
  response: BranchesResponse | undefined;
}) {
  if (response === undefined) {
    return <Spinner label="Loading branches" />;
  }

  if (response.error) {
    return <ErrorMessage>Couldn't load your branches, try again</ErrorMessage>;
  }

  if (response.data.length === 0) {
    return <p className="branch-list-empty">No branches yet</p>;
  }

  return (
    <ul className="branch-list">
      {response.data.map(({ id, name, side }) => (
        <li key={id}>
          <Link
            to={generatePath(BRANCH_ROUTE_PATH, { branchId: id })}
            aria-label={name}
            className="branch-list-item"
          >
            <span className="branch-list-name">{name}</span>
            <span className="branch-list-side">{side}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
