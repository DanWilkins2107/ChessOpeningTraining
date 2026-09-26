import { Link } from 'react-router-dom';
import { ACCOUNT_ROUTE_PATH } from '../../elements/router/router.constants';
import { DeleteAccountForm } from './elements/DeleteAccountForm/DeleteAccountForm';
import './page.css';

export function DeleteAccount() {
  return (
    <section className="delete-account-card">
      <h1 className="delete-account-heading">Delete account</h1>
      <DeleteAccountForm />
      <Link to={ACCOUNT_ROUTE_PATH} className="delete-account-back">
        Back to account
      </Link>
    </section>
  );
}
