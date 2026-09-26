import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../Button/Button';
import { ConfirmPasswordInput } from '../../elements/ConfirmPasswordInput/ConfirmPasswordInput';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { meetsEveryRule } from '../meetsEveryRule/meetsEveryRule';
import { PasswordChecklist } from '../PasswordChecklist/PasswordChecklist';
import { ReauthenticationCodeInput } from '../../elements/ReauthenticationCodeInput/ReauthenticationCodeInput';
import { savePassword } from '../../elements/savePassword/savePassword';
import { TextInput } from '../TextInput/TextInput';
import './NewPasswordForm.css';

type NewPasswordFormProps = {
  onSaved: () => unknown;
};

export function NewPasswordForm({ onSaved }: NewPasswordFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [awaitingCode, setAwaitingCode] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    const code = new FormData(form).get('code')?.toString();
    const { saved, error, codeSent } = await savePassword(password, code);
    setPending(false);
    setError(error);
    if (codeSent) setAwaitingCode(true);
    if (!saved) return;
    form.reset();
    setPassword('');
    setConfirmation('');
    setAwaitingCode(false);
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
      {awaitingCode && <ReauthenticationCodeInput />}
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
