import { Link, Outlet, useMatches } from 'react-router-dom';
import { PROTECTED_ROUTE_HANDLE, STUDIES_ROUTE_PATH } from './router.constants';
import { useUser } from './session';
import { SignOut } from './SignOut';
import './RootLayout.css';

export function RootLayout() {
  const user = useUser();
  const onProtectedPage = useMatches().some(
    ({ handle }) => handle === PROTECTED_ROUTE_HANDLE,
  );
  const showNav = onProtectedPage || Boolean(user);

  return (
    <>
      <header className="root-layout-header">
        <Link to="/" className="root-layout-wordmark">
          Chess Opening Training
        </Link>
        <nav className="root-layout-nav">
          {showNav && (
            <Link to={STUDIES_ROUTE_PATH} className="root-layout-nav-link">
              Studies
            </Link>
          )}
          <SignOut showButton={showNav} />
        </nav>
      </header>
      <main className="root-layout-main">
        <Outlet />
      </main>
    </>
  );
}
