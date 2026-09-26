import { useState } from 'react';
import { NewPasswordForm } from '../../../elements/NewPasswordForm';
import { SuccessMessage } from '../../../elements/SuccessMessage';
import './ChangePassword.css';

export function ChangePassword() {
  const [changed, setChanged] = useState(false);

  return (
    <section className="change-password">
      <h2 className="change-password-heading">Change password</h2>
      {changed && <SuccessMessage>Password changed</SuccessMessage>}
      <NewPasswordForm onSaved={() => setChanged(true)} />
    </section>
  );
}
