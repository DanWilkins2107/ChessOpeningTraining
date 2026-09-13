import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import './RootLayout.css';

export function RootLayout() {
  return (
    <>
      <header className="root-layout-header">
        <Link to="/" className="root-layout-wordmark">
          Chess Opening Training
        </Link>
      </header>
      <main className="root-layout-main">
        <Suspense fallback="Loading…">
          <Outlet />
        </Suspense>
      </main>
    </>
  );
}
