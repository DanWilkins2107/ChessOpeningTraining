import { Link } from 'react-router-dom';
import { DeleteAccountForm } from './elements/DeleteAccountForm/DeleteAccountForm';
import './page.css';

export function DeleteAccount() {
  return (
    <section className="delete-account-card">
      <h1 className="delete-account-heading">Delete account</h1>
      <DeleteAccountForm />
      <Link to="/account" className="delete-account-back">
        Back to account
      </Link>
    </section>
  );
}
