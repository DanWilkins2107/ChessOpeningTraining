import { use } from 'react';
import type { BranchResponse } from '../BranchResponse/BranchResponse';
import './ChapterList.css';

export function ChapterList({ branch }: { branch: Promise<BranchResponse> }) {
  const { data } = use(branch);

  if (data === null) return null;

  if (data.chapters.length === 0) {
    return <p className="chapter-list-empty">No chapters yet</p>;
  }

  return (
    <ul aria-label="Chapters" className="chapter-list">
      {data.chapters.map(({ id, name }) => (
        <li key={id} className="chapter-list-item">
          {name}
        </li>
      ))}
    </ul>
  );
}
