import { Link, useMatches } from 'react-router-dom';
import { PROTECTED_ROUTE_HANDLE, STUDIES_ROUTE_PATH } from './router.constants';
import { SignOut } from './SignOut';
import './HeaderNav.css';

export function HeaderNav() {
  const onProtectedPage = useMatches().some(
    ({ handle }) => handle === PROTECTED_ROUTE_HANDLE,
  );

  // The route's own handle decides, not the user, so the links are there from
  // the first paint of a protected page. A visitor who turns out to be nobody
  // is redirected to sign in, which is public, and the nav goes with them.
  if (!onProtectedPage) return null;

  return (
    <nav className="header-nav">
      <Link to={STUDIES_ROUTE_PATH} className="header-nav-link">
        Studies
      </Link>
      <SignOut />
    </nav>
  );
}
