import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from './Button';
import { ConfirmPasswordInput } from './ConfirmPasswordInput';
import { ErrorMessage } from './ErrorMessage';
import { meetsEveryRule } from './meetsEveryRule';
import { PasswordChecklist } from './PasswordChecklist';
import { ReauthenticationCodeInput } from './ReauthenticationCodeInput';
import { savePassword } from './savePassword';
import { TextInput } from './TextInput';
import './NewPasswordForm.css';

type NewPasswordFormProps = {
  onSaved: () => unknown;
};

export function NewPasswordForm({ onSaved }: NewPasswordFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  // Undefined until the server asks for a reauthentication code.
  const [code, setCode] = useState<string>();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    const { status, error } = await savePassword(password, code);
    setPending(false);
    setError(error);
    if (status === 'code-sent') setCode('');
    if (status !== 'saved') return;
    form.reset();
    setPassword('');
    setConfirmation('');
    setCode(undefined);
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
      {code !== undefined && <ReauthenticationCodeInput onChange={setCode} />}
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
