import { useState } from 'react';
import { NewPasswordForm } from '../../../../shared/NewPasswordForm/NewPasswordForm';
import { SuccessMessage } from '../../../../shared/SuccessMessage/SuccessMessage';
import { PASSWORD_CHANGED_MESSAGE } from './ChangePasswordForm.constants';
import './ChangePasswordForm.css';

export function ChangePasswordForm() {
  const [changed, setChanged] = useState(false);

  return (
    <div className="change-password-form">
      {changed && <SuccessMessage>{PASSWORD_CHANGED_MESSAGE}</SuccessMessage>}
      <NewPasswordForm onSaved={() => setChanged(true)} />
    </div>
  );
}
