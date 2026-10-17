import { Button } from '../../../../../shared/Button/Button';
import { ErrorMessage } from '../../../../../shared/ErrorMessage/ErrorMessage';
import './FolderLoadError.css';

export function FolderLoadError({ retry }: { retry: () => void }) {
  return (
    <form className="folder-load-error" action={retry}>
      <ErrorMessage>Couldn't load this folder</ErrorMessage>
      <Button disabled={false}>Try again</Button>
    </form>
  );
}
