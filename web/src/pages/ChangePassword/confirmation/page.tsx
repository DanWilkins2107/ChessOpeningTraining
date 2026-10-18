import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useOutletContext } from 'react-router-dom';
import { Button } from '../../../shared/Button/Button';
import { ErrorMessage } from '../../../shared/ErrorMessage/ErrorMessage';
import { newPasswordErrorMessage } from '../../../shared/newPasswordErrorMessage/newPasswordErrorMessage';
import { SuccessMessage } from '../../../shared/SuccessMessage/SuccessMessage';
import { supabase } from '../../../supabase';
import { PASSWORD_CHANGED_MESSAGE } from '../page.constants';
import { ReauthenticationCodeInput } from './elements/ReauthenticationCodeInput/ReauthenticationCodeInput';
import './page.css';

export function ChangePasswordConfirmation() {
  const pendingPassword = useOutletContext<string | undefined>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [changed, setChanged] = useState(false);

  if (pendingPassword === undefined) return <Navigate to=".." replace />;
  if (changed)
    return <SuccessMessage>{PASSWORD_CHANGED_MESSAGE}</SuccessMessage>;

  async function confirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nonce = String(new FormData(event.currentTarget).get('code'));
    setPending(true);
    const { error } = await supabase.auth.updateUser({
      password: pendingPassword,
      nonce,
    });
    setPending(false);
    if (error) setError(newPasswordErrorMessage(error));
    else setChanged(true);
  }

  return (
    <form className="change-password-confirmation-form" onSubmit={confirm}>
      <ReauthenticationCodeInput />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button disabled={pending}>Confirm</Button>
    </form>
  );
}
