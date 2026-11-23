import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { MoveTreeLayout } from '../MoveTreeLayout/MoveTreeLayout';

export function MoveTreeLoadError() {
  return (
    <MoveTreeLayout>
      <ErrorMessage>Couldn't load this move tree, try again</ErrorMessage>
    </MoveTreeLayout>
  );
}
