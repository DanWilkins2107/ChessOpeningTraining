import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { SIGN_IN_ROUTE_PATH } from '../../pages/(auth)/sign-in/router.constants';
import { useUser } from '../../shared/useUser/useUser';

export function ProtectedLayout() {
  const user = useUser();
  const { pathname, search } = useLocation();

  if (user === null) {
    const next = encodeURIComponent(pathname + search);
    return <Navigate to={`${SIGN_IN_ROUTE_PATH}?next=${next}`} replace />;
  }

  return <Outlet />;
}
