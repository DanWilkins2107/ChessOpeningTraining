import { Link, useMatches } from 'react-router-dom';
import { PROTECTED_ROUTE_HANDLE, STUDIES_ROUTE_PATH } from './router.constants';
import { useUser } from './session';
import { SignOut } from './SignOut';
import './HeaderNav.css';

export function HeaderNav() {
  const user = useUser();
  const onProtectedPage = useMatches().some(
    ({ handle }) => handle === PROTECTED_ROUTE_HANDLE,
  );
  // A protected page shows its links before the user resolves, for perceived
  // performance: if the user turns out to be nobody, ProtectedLayout redirects
  // to sign in, which is public, and the links go with it.
  const showLinks = onProtectedPage || Boolean(user);

  return (
    <nav className="header-nav">
      {showLinks && (
        <Link to={STUDIES_ROUTE_PATH} className="header-nav-link">
          Studies
        </Link>
      )}
      <SignOut showButton={showLinks} />
    </nav>
  );
}
