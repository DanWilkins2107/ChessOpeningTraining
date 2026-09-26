import { Link, useNavigate } from 'react-router-dom';
import {
  SIGNED_OUT_DONE,
  SIGNED_OUT_PARAM,
  SIGNED_OUT_PENDING,
} from '../../shared/signOut/signOut.constants';
import { CHANGE_PASSWORD_ROUTE_PATH } from '../../shared/routes/routes.constants';
import { supabase } from '../../supabase';
import './page.css';

export function Account() {
  const navigate = useNavigate();

  async function signOut() {
    const leaveWith = (outcome: string) =>
      navigate(`/sign-in?${SIGNED_OUT_PARAM}=${outcome}`, { replace: true });

    // Leaving first, while this page still owns the route: once the session
    // goes, ProtectedLayout redirects to its own sign-in URL and would win.
    leaveWith(SIGNED_OUT_PENDING);
    await supabase.auth.signOut({ scope: 'local' });
    leaveWith(SIGNED_OUT_DONE);
  }

  return (
    <section className="account-card">
      <h1 className="account-heading">Account</h1>
      <Link to={CHANGE_PASSWORD_ROUTE_PATH} className="account-action">
        Change password
      </Link>
      <button type="button" className="account-action" onClick={signOut}>
        Sign out
      </button>
    </section>
  );
}
