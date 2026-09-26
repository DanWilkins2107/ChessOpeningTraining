import { Link, Outlet } from 'react-router-dom';
import { HeaderNav } from '../HeaderNav/HeaderNav';
import './RootLayout.css';

export function RootLayout() {
  return (
    <>
      <header className="root-layout-header">
        <Link to="/" className="root-layout-wordmark">
          Chess Opening Training
        </Link>
        <HeaderNav />
      </header>
      <main className="root-layout-main">
        <Outlet />
      </main>
    </>
  );
}
