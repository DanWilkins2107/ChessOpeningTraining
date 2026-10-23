import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NewPasswordForm } from '../../../../../shared/NewPasswordForm/NewPasswordForm';
import { SuccessMessage } from '../../../../../shared/SuccessMessage/SuccessMessage';
import { CHANGE_PASSWORD_CONFIRMATION_ROUTE_PATH } from '../../router.constants';
import { savePassword } from '../savePassword/savePassword';
import { PASSWORD_CHANGED_MESSAGE } from '../../page.constants';
import './ChangePasswordForm.css';

type ChangePasswordFormProps = {
  onCodeSent: (password: string) => void;
};

export function ChangePasswordForm({ onCodeSent }: ChangePasswordFormProps) {
  const [changed, setChanged] = useState(false);
  const navigate = useNavigate();

  async function save(password: string) {
    const { error, codeSent } = await savePassword(password);
    if (codeSent) {
      onCodeSent(password);
      await navigate(CHANGE_PASSWORD_CONFIRMATION_ROUTE_PATH);
    }
    if (!error && !codeSent) setChanged(true);
    return error;
  }

  return (
    <div className="change-password-form">
      {changed && <SuccessMessage>{PASSWORD_CHANGED_MESSAGE}</SuccessMessage>}
      <NewPasswordForm save={save} />
    </div>
  );
}
