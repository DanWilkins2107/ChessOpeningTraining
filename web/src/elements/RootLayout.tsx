import { Link, Outlet } from 'react-router-dom';
import { ACCOUNT_ROUTE_PATH } from './router.constants';
import { useUser } from './session';
import './RootLayout.css';

export function RootLayout() {
  const user = useUser();

  return (
    <>
      <header className="root-layout-header">
        <Link to="/" className="root-layout-wordmark">
          Chess Opening Training
        </Link>
        {user && <Link to={ACCOUNT_ROUTE_PATH}>Account</Link>}
      </header>
      <main className="root-layout-main">
        <Outlet />
      </main>
    </>
  );
}
