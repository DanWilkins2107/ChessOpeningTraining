import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { MoveTreeLayout } from '../MoveTreeLayout/MoveTreeLayout';

export function MoveTreeNotFound() {
  return (
    <MoveTreeLayout>
      <ErrorMessage>Move tree not found</ErrorMessage>
    </MoveTreeLayout>
  );
}
