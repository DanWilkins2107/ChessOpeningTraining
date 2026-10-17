import { AnimatePiecesRow } from '../AnimatePiecesRow/AnimatePiecesRow';
import './AnimatePiecesLoading.css';

export function AnimatePiecesLoading() {
  return (
    <AnimatePiecesRow>
      <span
        role="status"
        aria-label="Loading your setting"
        className="animate-pieces-placeholder"
      />
    </AnimatePiecesRow>
  );
}
