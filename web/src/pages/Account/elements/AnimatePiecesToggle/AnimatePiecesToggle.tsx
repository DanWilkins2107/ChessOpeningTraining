import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { SuccessMessage } from '../../../../shared/SuccessMessage/SuccessMessage';
import { AnimatePiecesRow } from '../AnimatePiecesRow/AnimatePiecesRow';
import { useAnimatePieces } from '../useAnimatePieces/useAnimatePieces';
import { useSaveAnimatePieces } from '../useSaveAnimatePieces/useSaveAnimatePieces';
import './AnimatePiecesToggle.css';

export function AnimatePiecesToggle() {
  const { data } = useAnimatePieces();
  const { animatePieces, choose, outcome } = useSaveAnimatePieces(data);

  return (
    <>
      <AnimatePiecesRow>
        <input
          type="checkbox"
          role="switch"
          className="animate-pieces-switch"
          checked={animatePieces}
          onChange={(event) => choose(event.target.checked)}
        />
      </AnimatePiecesRow>
      {outcome === 'failed' && (
        <ErrorMessage>Couldn't save your setting, try again</ErrorMessage>
      )}
      {outcome === 'saved' && <SuccessMessage>Saved</SuccessMessage>}
    </>
  );
}
