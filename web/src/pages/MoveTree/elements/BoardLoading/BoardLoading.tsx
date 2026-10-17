import { Spinner } from '../../../../shared/Spinner/Spinner';
import './BoardLoading.css';

export function BoardLoading() {
  return (
    <div className="board-loading">
      <Spinner label="Loading board" />
    </div>
  );
}
