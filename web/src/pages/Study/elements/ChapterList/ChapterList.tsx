import { use } from 'react';
import type { StudyResponse } from '../StudyResponse/StudyResponse';
import './ChapterList.css';

export function ChapterList({ study }: { study: Promise<StudyResponse> }) {
  const { data } = use(study);

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
