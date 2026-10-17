import { LoadBoundary } from '../../../../shared/LoadBoundary/LoadBoundary';
import { AnimatePiecesLoadError } from '../AnimatePiecesLoadError/AnimatePiecesLoadError';
import { AnimatePiecesLoading } from '../AnimatePiecesLoading/AnimatePiecesLoading';
import { AnimatePiecesToggle } from '../AnimatePiecesToggle/AnimatePiecesToggle';
import './AnimatePiecesSetting.css';

export function AnimatePiecesSetting() {
  return (
    <div className="animate-pieces">
      <LoadBoundary
        Loading={AnimatePiecesLoading}
        LoadError={AnimatePiecesLoadError}
      >
        <AnimatePiecesToggle />
      </LoadBoundary>
    </div>
  );
}
