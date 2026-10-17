// fallow-ignore-file unused-file -- ef93ff81 2026-11-16 landed ahead of the folder page, its first consumer.
import { Spinner } from '../../shared/Spinner/Spinner';
import './BoardLoading.css';

export function BoardLoading() {
  return (
    <div className="board-loading">
      <Spinner label="Loading board" />
    </div>
  );
}
