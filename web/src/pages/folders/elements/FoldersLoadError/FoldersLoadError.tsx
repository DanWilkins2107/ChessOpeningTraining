import { Button } from '../../../../shared/Button/Button';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import './FoldersLoadError.css';

export function FoldersLoadError({ retry }: { retry: () => void }) {
  return (
    <div className="folders-load-error">
      <ErrorMessage>Couldn't load your folders</ErrorMessage>
      <Button disabled={false} onClick={retry}>
        Try again
      </Button>
    </div>
  );
}
