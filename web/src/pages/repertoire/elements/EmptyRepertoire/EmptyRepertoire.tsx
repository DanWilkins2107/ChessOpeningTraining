import { Button } from '../../../../shared/Button/Button';
import { FolderTile } from '../FolderTile/FolderTile';
import { PawnTile } from '../PawnTile/PawnTile';
import './EmptyRepertoire.css';

export function EmptyRepertoire({
  onCreateFolder,
}: {
  onCreateFolder: () => void;
}) {
  return (
    <div className="empty-repertoire">
      <div className="empty-repertoire-tiles" aria-hidden="true">
        <FolderTile />
        <PawnTile side="white" />
      </div>
      <h2 className="empty-repertoire-title">Nothing here yet</h2>
      <Button disabled={false} onClick={onCreateFolder}>
        Create folder
      </Button>
    </div>
  );
}
