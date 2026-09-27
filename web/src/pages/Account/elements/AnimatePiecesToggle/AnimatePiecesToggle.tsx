import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import type { AnimatePiecesSetting } from '../AnimatePiecesSetting/AnimatePiecesSetting';
import { useSaveAnimatePieces } from '../useSaveAnimatePieces/useSaveAnimatePieces';
import './AnimatePiecesToggle.css';

type AnimatePiecesToggleProps = { setting: AnimatePiecesSetting };

export function AnimatePiecesToggle({ setting }: AnimatePiecesToggleProps) {
  const { animatePieces, choose, saveFailed } = useSaveAnimatePieces(
    setting.animatePieces,
  );

  return (
    <div className="animate-pieces">
      {setting.status === 'loaded' ? (
        <label className="animate-pieces-row">
          Animate pieces
          <input
            type="checkbox"
            role="switch"
            className="animate-pieces-switch"
            checked={animatePieces}
            onChange={(event) => choose(event.target.checked)}
          />
        </label>
      ) : (
        <div className="animate-pieces-row">
          Animate pieces
          {setting.status === 'loading' && (
            <span
              role="status"
              aria-label="Loading your setting"
              className="animate-pieces-placeholder"
            />
          )}
        </div>
      )}
      {setting.status === 'failed' && (
        <ErrorMessage>Couldn't load your settings, try again</ErrorMessage>
      )}
      {saveFailed && (
        <ErrorMessage>Couldn't save your setting, try again</ErrorMessage>
      )}
    </div>
  );
}
