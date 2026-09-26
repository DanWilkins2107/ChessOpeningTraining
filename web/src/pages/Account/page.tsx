import { useNavigate } from 'react-router-dom';
import {
  SIGNED_OUT_DONE,
  SIGNED_OUT_PARAM,
  SIGNED_OUT_PENDING,
} from '../../elements/signOut.constants';
import { supabase } from '../../supabase';
import { ChangeEmailForm } from './elements/ChangeEmailForm';
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
      <ChangeEmailForm />
      <button type="button" className="account-action" onClick={signOut}>
        Sign out
      </button>
    </section>
  );
}
