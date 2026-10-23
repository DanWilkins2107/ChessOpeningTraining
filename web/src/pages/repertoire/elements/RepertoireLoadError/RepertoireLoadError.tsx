import { Button } from '../../../../shared/Button/Button';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import './RepertoireLoadError.css';

export function RepertoireLoadError({ retry }: { retry: () => void }) {
  return (
    <div className="repertoire-load-error">
      <ErrorMessage>Couldn't load your repertoire</ErrorMessage>
      <Button disabled={false} onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
