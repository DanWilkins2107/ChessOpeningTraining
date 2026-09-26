import { Link, useMatches } from 'react-router-dom';
import {
  ACCOUNT_ROUTE_PATH,
  PROTECTED_ROUTE_HANDLE,
  STUDIES_ROUTE_PATH,
} from '../../shared/router/router.constants';
import './HeaderNav.css';

export function HeaderNav() {
  const onProtectedPage = useMatches().some(
    ({ handle }) => handle === PROTECTED_ROUTE_HANDLE,
  );

  // The route's own handle decides which signed-in links show, not the user, so
  // they are there from the first paint of a protected page. A visitor who
  // turns out to be nobody is redirected to sign in, which is public, and those
  // links go with them.
  //
  // Account is offered everywhere, signed in or not: following it from a public
  // page redirects to sign in carrying `next=/account`, which lands them on the
  // account page once they are in.
  return (
    <nav className="header-nav">
      {onProtectedPage && (
        <Link to={STUDIES_ROUTE_PATH} className="header-nav-link">
          Studies
        </Link>
      )}
      <Link to={ACCOUNT_ROUTE_PATH} className="header-nav-link">
        Account
      </Link>
    </nav>
  );
}
