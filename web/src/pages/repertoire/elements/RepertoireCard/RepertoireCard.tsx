import type { ReactNode } from 'react';
import './RepertoireCard.css';

export function RepertoireCard({ children }: { children: ReactNode }) {
  return <div className="repertoire-card">{children}</div>;
}
