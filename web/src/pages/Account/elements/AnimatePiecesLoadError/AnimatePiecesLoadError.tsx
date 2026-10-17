import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { AnimatePiecesRow } from '../AnimatePiecesRow/AnimatePiecesRow';

export function AnimatePiecesLoadError() {
  return (
    <>
      <AnimatePiecesRow />
      <ErrorMessage>Couldn't load your settings, try again</ErrorMessage>
    </>
  );
}
