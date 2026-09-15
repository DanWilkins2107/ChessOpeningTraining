import {
  Navigate,
  Outlet,
  useLocation,
  useOutletContext,
} from 'react-router-dom';
import { useUser } from './session';

export function ProtectedLayout() {
  const user = useUser();
  const { pathname, search } = useLocation();
  const context = useOutletContext();

  if (user === null) {
    const next = encodeURIComponent(pathname + search);
    return <Navigate to={`/sign-in?next=${next}`} replace />;
  }

  return <Outlet context={context} />;
}
