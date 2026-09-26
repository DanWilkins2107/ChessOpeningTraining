import { Link } from 'react-router-dom';
import { ACCOUNT_ROUTE_PATH } from '../../elements/router.constants';
import { ChangePasswordForm } from './elements/ChangePasswordForm';
import './page.css';

export function ChangePassword() {
  return (
    <section className="change-password-card">
      <h1 className="change-password-heading">Change password</h1>
      <ChangePasswordForm />
      <Link to={ACCOUNT_ROUTE_PATH} className="change-password-back">
        Back to account
      </Link>
    </section>
  );
}
