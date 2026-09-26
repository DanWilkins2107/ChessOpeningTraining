import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../elements/Button';
import { ErrorMessage } from '../../../elements/ErrorMessage';
import { ACCOUNT_ROUTE_PATH } from '../../../elements/router.constants';
import { useUser } from '../../../elements/session';
import { TextInput } from '../../../elements/TextInput';
import { supabase } from '../../../supabase';
import { changeEmailErrorMessage } from './changeEmailErrorMessage';
import { CurrentEmail } from './CurrentEmail';
import { EmailLinkMessage } from './EmailLinkMessage';
import './ChangeEmailForm.css';

export function ChangeEmailForm() {
  const user = useUser();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldsValid, setFieldsValid] = useState<boolean>();

  async function changeEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const { error } = await supabase.auth.updateUser(
      { email: String(form.get('email')) },
      { emailRedirectTo: window.location.origin + ACCOUNT_ROUTE_PATH },
    );
    setPending(false);
    setError(error ? changeEmailErrorMessage(error) : undefined);
  }

  return (
    <form
      className="change-email-form"
      onSubmit={changeEmail}
      onChange={(event) => setFieldsValid(event.currentTarget.checkValidity())}
    >
      {user && <CurrentEmail user={user} />}
      <EmailLinkMessage />
      <TextInput
        label="New email"
        name="email"
        type="email"
        autoComplete="email"
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button disabled={pending || !fieldsValid}>Change email</Button>
    </form>
  );
}
