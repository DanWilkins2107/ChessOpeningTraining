import { useId, useState } from 'react';
import type { Folder } from '../Folder/Folder';
import { MoveTreeItem } from '../MoveTreeItem/MoveTreeItem';
import type { RepertoireMoveTree } from '../RepertoireMoveTree/RepertoireMoveTree';
import './FolderItem.css';

export function FolderItem({
  folder,
  moveTrees,
}: {
  folder: Folder;
  moveTrees: RepertoireMoveTree[];
}) {
  const [expanded, setExpanded] = useState(false);
  const contentsId = useId();

  return (
    <li className="folder-item">
      <button
        type="button"
        className="folder-item-toggle"
        aria-expanded={expanded}
        aria-controls={contentsId}
        onClick={() => setExpanded(!expanded)}
      >
        <svg
          className="folder-item-chevron"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
        <svg
          className="folder-item-icon"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M3 6a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        </svg>
        <span className="folder-item-name">{folder.name}</span>
      </button>
      <div id={contentsId} className="folder-item-contents" hidden={!expanded}>
        {moveTrees.length === 0 ? (
          <p className="folder-item-empty">Empty folder</p>
        ) : (
          <ul className="folder-item-list">
            {moveTrees.map((moveTree) => (
              <MoveTreeItem key={moveTree.id} moveTree={moveTree} />
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}
