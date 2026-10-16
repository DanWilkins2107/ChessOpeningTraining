import { LoadBoundary } from '../../../../shared/LoadBoundary/LoadBoundary';
import { useUser } from '../../../../shared/useUser/useUser';
import { AnimatePiecesLoadError } from '../AnimatePiecesLoadError/AnimatePiecesLoadError';
import { AnimatePiecesLoading } from '../AnimatePiecesLoading/AnimatePiecesLoading';
import { AnimatePiecesToggle } from '../AnimatePiecesToggle/AnimatePiecesToggle';
import './AnimatePiecesSetting.css';

export function AnimatePiecesSetting() {
  const userId = useUser()?.id;

  return (
    <div className="animate-pieces">
      {userId === undefined ? (
        <AnimatePiecesLoading />
      ) : (
        <LoadBoundary
          Loading={AnimatePiecesLoading}
          LoadError={AnimatePiecesLoadError}
        >
          <AnimatePiecesToggle userId={userId} />
        </LoadBoundary>
      )}
    </div>
  );
}
