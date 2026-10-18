import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../Button/Button';
import { ConfirmPasswordInput } from '../../elements/ConfirmPasswordInput/ConfirmPasswordInput';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { meetsEveryRule } from '../meetsEveryRule/meetsEveryRule';
import { newPasswordErrorMessage } from '../../elements/newPasswordErrorMessage/newPasswordErrorMessage';
import { PasswordChecklist } from '../PasswordChecklist/PasswordChecklist';
import { TextInput } from '../TextInput/TextInput';
import { supabase } from '../../supabase';
import './NewPasswordForm.css';

type NewPasswordFormProps = {
  onSaved: () => unknown;
};

export function NewPasswordForm({ onSaved }: NewPasswordFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (error) {
      setError(newPasswordErrorMessage(error));
      return;
    }
    form.reset();
    setPassword('');
    setConfirmation('');
    setError(undefined);
    await onSaved();
  }

  return (
    <form className="new-password-form" onSubmit={save}>
      <TextInput
        label="New password"
        name="password"
        type="password"
        autoComplete="new-password"
        onChange={setPassword}
      />
      <PasswordChecklist password={password} />
      <ConfirmPasswordInput
        password={password}
        confirmation={confirmation}
        onChange={setConfirmation}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button
        disabled={
          pending || !meetsEveryRule(password) || confirmation !== password
        }
      >
        Save password
      </Button>
    </form>
  );
}
