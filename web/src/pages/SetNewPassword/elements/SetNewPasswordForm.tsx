import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../elements/Button';
import { ErrorMessage } from '../../../elements/ErrorMessage';
import { meetsEveryRule } from '../../../elements/meetsEveryRule';
import { PasswordChecklist } from '../../../elements/PasswordChecklist';
import { TextInput } from '../../../elements/TextInput';
import { supabase } from '../../../supabase';
import { setNewPasswordErrorMessage } from './setNewPasswordErrorMessage';
import './SetNewPasswordForm.css';

export function SetNewPasswordForm() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState('');

  async function setNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) setError(setNewPasswordErrorMessage(error));
    else await navigate('/', { replace: true });
  }

  return (
    <form className="set-new-password-form" onSubmit={setNewPassword}>
      <TextInput
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        onChange={setPassword}
      />
      <PasswordChecklist password={password} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button disabled={pending || !meetsEveryRule(password)}>
        Save password
      </Button>
    </form>
  );
}
