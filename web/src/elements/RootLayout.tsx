import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { SignOut } from './SignOut';
import './RootLayout.css';

export function RootLayout() {
  return (
    <>
      <header className="root-layout-header">
        <Link to="/" className="root-layout-wordmark">
          Chess Opening Training
        </Link>
        <Suspense>
          <SignOut />
        </Suspense>
      </header>
      <main className="root-layout-main">
        <Outlet />
      </main>
    </>
  );
}
