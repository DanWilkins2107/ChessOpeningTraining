import type { RepertoireFolder } from '../RepertoireFolder/RepertoireFolder';
import './FolderItem.css';

export function FolderItem({ folder: { name } }: { folder: RepertoireFolder }) {
  return (
    <li className="folder-item">
      <svg className="folder-item-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      </svg>
      <span className="folder-item-name">{name}</span>
    </li>
  );
}
