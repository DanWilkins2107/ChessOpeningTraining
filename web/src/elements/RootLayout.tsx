import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ProfileLink } from './ProfileLink';
import './RootLayout.css';

export function RootLayout() {
  const [signOutError, setSignOutError] = useState<string>();

  return (
    <>
      <header className="root-layout-header">
        <Link to="/" className="root-layout-wordmark">
          Chess Opening Training
        </Link>
        <ProfileLink signOutError={signOutError} />
      </header>
      <main className="root-layout-main">
        <Outlet context={setSignOutError} />
      </main>
    </>
  );
}
