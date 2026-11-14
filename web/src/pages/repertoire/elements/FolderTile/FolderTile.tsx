import './FolderTile.css';

export function FolderTile() {
  return (
    <span className="folder-tile">
      <svg className="folder-tile-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h4l2 2.2h7A2.5 2.5 0 0 1 21 8.7v8.8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5Z" />
      </svg>
    </span>
  );
}
