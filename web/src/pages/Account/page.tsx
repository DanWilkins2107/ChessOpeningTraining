import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../supabase';
import './page.css';

export function Account() {
  const setSignOutError = useOutletContext<(message?: string) => void>();

  async function signOut() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    setSignOutError(error?.message);
  }

  return (
    <section className="account-card">
      <h1 className="account-heading">Account</h1>
      <button type="button" className="account-action" onClick={signOut}>
        Sign out
      </button>
    </section>
  );
}
