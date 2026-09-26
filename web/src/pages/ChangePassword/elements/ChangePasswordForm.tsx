import { useState } from 'react';
import { NewPasswordForm } from '../../../elements/NewPasswordForm';
import { SuccessMessage } from '../../../elements/SuccessMessage';
import './ChangePasswordForm.css';

export function ChangePasswordForm() {
  const [changed, setChanged] = useState(false);

  return (
    <div className="change-password-form">
      {changed && <SuccessMessage>Password changed</SuccessMessage>}
      <NewPasswordForm onSaved={() => setChanged(true)} />
    </div>
  );
}
