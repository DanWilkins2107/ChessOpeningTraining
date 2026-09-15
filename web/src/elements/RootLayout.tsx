import { Link, Outlet } from 'react-router-dom';
import { STUDIES_ROUTE_PATH } from './router.constants';
import { useUser } from './session';
import { SignOut } from './SignOut';
import './RootLayout.css';

export function RootLayout() {
  const user = useUser();

  return (
    <>
      <header className="root-layout-header">
        <Link to="/" className="root-layout-wordmark">
          Chess Opening Training
        </Link>
        <nav className="root-layout-nav">
          {user && (
            <Link to={STUDIES_ROUTE_PATH} className="root-layout-nav-link">
              Studies
            </Link>
          )}
          <SignOut />
        </nav>
      </header>
      <main className="root-layout-main">
        <Outlet />
      </main>
    </>
  );
}
