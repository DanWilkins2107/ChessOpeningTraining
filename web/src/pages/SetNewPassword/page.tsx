import { Link, useNavigate } from 'react-router-dom';
import { newPasswordErrorMessage } from '../../shared/newPasswordErrorMessage/newPasswordErrorMessage';
import { NewPasswordForm } from '../../shared/NewPasswordForm/NewPasswordForm';
import { useUser } from '../../shared/useUser/useUser';
import { supabase } from '../../supabase';
import './page.css';

export function SetNewPassword() {
  const user = useUser();
  const navigate = useNavigate();

  async function save(password: string) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return newPasswordErrorMessage(error);
    await navigate('/', { replace: true });
  }

  return (
    <section className="set-new-password-card">
      <h1 className="set-new-password-heading">Set new password</h1>
      {user === undefined && <p>Checking your reset link</p>}
      {user === null && (
        <>
          <p>That reset link is invalid or has expired</p>
          <Link to="/forgot-password" className="set-new-password-link">
            Request a new link
          </Link>
        </>
      )}
      {user && <NewPasswordForm save={save} />}
    </section>
  );
}
