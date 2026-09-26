import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from './Button';
import { ErrorMessage } from './ErrorMessage';
import { meetsEveryRule } from './meetsEveryRule';
import { PasswordChecklist } from './PasswordChecklist';
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
  // Undefined until the server asks for a reauthentication code.
  const [code, setCode] = useState<string>();

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    const outcome = await savePassword(password, code ?? '');
    setPending(false);
    setError(typeof outcome === 'object' ? outcome.error : undefined);
    if (outcome === 'code-sent') setCode('');
    if (outcome !== 'saved') return;
    form.reset();
    setPassword('');
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
      {code !== undefined && (
        <>
          <p>We've emailed you a code to confirm it's you</p>
          <TextInput
            label="Code"
            name="code"
            type="text"
            autoComplete="one-time-code"
            onChange={setCode}
          />
        </>
      )}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button disabled={pending || !meetsEveryRule(password)}>
        Save password
      </Button>
    </form>
  );
}
