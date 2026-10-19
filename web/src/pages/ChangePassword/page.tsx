import { useState } from 'react';
import { Link, useOutlet } from 'react-router-dom';
import { ChangePasswordForm } from './elements/ChangePasswordForm/ChangePasswordForm';
import './page.css';

export function ChangePassword() {
  const [pendingPassword, setPendingPassword] = useState<string>();
  const confirmation = useOutlet(pendingPassword);

  return (
    <section className="change-password-card">
      <h1 className="change-password-heading">Change password</h1>
      {confirmation ?? <ChangePasswordForm onCodeSent={setPendingPassword} />}
      <Link to="/account" className="change-password-back">
        Back to account
      </Link>
    </section>
  );
}
