import { Link } from 'react-router-dom';
import { useUser } from '../../shared/session/session';
import { SetNewPasswordForm } from './elements/SetNewPasswordForm/SetNewPasswordForm';
import './page.css';

export function SetNewPassword() {
  const user = useUser();

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
      {user && <SetNewPasswordForm />}
    </section>
  );
}
