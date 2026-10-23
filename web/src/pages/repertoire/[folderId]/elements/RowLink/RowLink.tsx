import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './RowLink.css';

export function RowLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="row-link">
      {children}
    </Link>
  );
}
