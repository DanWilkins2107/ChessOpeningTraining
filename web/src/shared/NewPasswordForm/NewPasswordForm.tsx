import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../Button/Button';
import { ConfirmPasswordInput } from '../../elements/ConfirmPasswordInput/ConfirmPasswordInput';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { meetsEveryRule } from '../meetsEveryRule/meetsEveryRule';
import { PasswordChecklist } from '../PasswordChecklist/PasswordChecklist';
import { TextInput } from '../TextInput/TextInput';
import './NewPasswordForm.css';

type NewPasswordFormProps = {
  save: (password: string) => Promise<string | undefined>;
};

export function NewPasswordForm({ save }: NewPasswordFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    const error = await save(password);
    setPending(false);
    setError(error);
    if (error) return;
    form.reset();
    setPassword('');
    setConfirmation('');
  }

  return (
    <form className="new-password-form" onSubmit={submit}>
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
