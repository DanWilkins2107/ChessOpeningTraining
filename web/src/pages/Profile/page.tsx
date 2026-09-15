import { Link, useOutletContext } from 'react-router-dom';
import { ACCOUNT_ROUTE_PATH } from '../../elements/router.constants';
import { supabase } from '../../supabase';
import './page.css';

export function Profile() {
  const setSignOutError = useOutletContext<(message?: string) => void>();

  async function signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    setSignOutError(error?.message);
  }

  return (
    <section className="profile-card">
      <h1 className="profile-heading">Profile</h1>
      <ul className="profile-actions">
        <li>
          <Link to={ACCOUNT_ROUTE_PATH} className="profile-action">
            Account
          </Link>
        </li>
        <li>
          <button type="button" className="profile-action" onClick={signOut}>
            Sign out
          </button>
        </li>
      </ul>
    </section>
  );
}
