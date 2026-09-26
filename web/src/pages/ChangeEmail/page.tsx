import { Link } from 'react-router-dom';
import { ACCOUNT_ROUTE_PATH } from '../../shared/router/router.constants';
import { ChangeEmailForm } from './elements/ChangeEmailForm/ChangeEmailForm';
import './page.css';

export function ChangeEmail() {
  return (
    <section className="change-email-card">
      <h1 className="change-email-heading">Change email</h1>
      <ChangeEmailForm />
      <Link to={ACCOUNT_ROUTE_PATH} className="change-email-back">
        Back to account
      </Link>
    </section>
  );
}
