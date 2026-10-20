import { FolderTile } from '../FolderTile/FolderTile';
import type { RepertoireFolder } from '../RepertoireFolder/RepertoireFolder';
import './FolderItem.css';

export function FolderItem({ folder: { name } }: { folder: RepertoireFolder }) {
  return (
    <li className="folder-item">
      <FolderTile />
      <span className="folder-item-name">{name}</span>
    </li>
  );
}
