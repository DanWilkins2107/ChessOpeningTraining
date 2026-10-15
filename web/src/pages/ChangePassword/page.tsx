import { Link } from 'react-router-dom';
import { ChangePasswordForm } from './elements/ChangePasswordForm/ChangePasswordForm';
import './page.css';

export function ChangePassword() {
  return (
    <section className="change-password-card">
      <h1 className="change-password-heading">Change password</h1>
      <ChangePasswordForm />
      <Link to="/account" className="change-password-back">
        Back to account
      </Link>
    </section>
  );
}
