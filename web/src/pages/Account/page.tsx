import { Link, useNavigate } from 'react-router-dom';
import { SIGN_IN_ROUTE_PATH } from '../(auth)/router.constants';
import {
  SIGNED_OUT_DONE,
  SIGNED_OUT_PARAM,
  SIGNED_OUT_PENDING,
} from '../../shared/signOut/signOut.constants';
import { supabase } from '../../supabase';
import { AnimatePiecesSetting } from './elements/AnimatePiecesSetting/AnimatePiecesSetting';
import './page.css';

export function Account() {
  const navigate = useNavigate();

  async function signOut() {
    const leaveWith = (outcome: string) =>
      navigate(`${SIGN_IN_ROUTE_PATH}?${SIGNED_OUT_PARAM}=${outcome}`, {
        replace: true,
      });

    // Leaving first, while this page still owns the route: once the session
    // goes, ProtectedLayout redirects to its own sign-in URL and would win.
    leaveWith(SIGNED_OUT_PENDING);
    await supabase.auth.signOut({ scope: 'local' });
    leaveWith(SIGNED_OUT_DONE);
  }

  return (
    <section className="account-card">
      <h1 className="account-heading">Account</h1>
      <Link to="/account/email" className="account-action">
        Change email
      </Link>
      <AnimatePiecesSetting />
      <Link to="/account/password" className="account-action">
        Change password
      </Link>
      <button type="button" className="account-action" onClick={signOut}>
        Sign out
      </button>
      <Link
        to="/account/delete"
        className="account-action account-action-danger"
      >
        Delete account
      </Link>
    </section>
  );
}
