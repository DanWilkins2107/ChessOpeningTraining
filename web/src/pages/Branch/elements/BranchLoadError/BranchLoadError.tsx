import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';

export function BranchLoadError() {
  return <ErrorMessage>Couldn't load this branch, try again</ErrorMessage>;
}
