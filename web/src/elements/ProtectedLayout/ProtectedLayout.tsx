import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../../shared/useUser/useUser';

export function ProtectedLayout() {
  const user = useUser();
  const { pathname, search } = useLocation();

  if (user === null) {
    const next = encodeURIComponent(pathname + search);
    return <Navigate to={`/sign-in?next=${next}`} replace />;
  }

  return <Outlet />;
}
