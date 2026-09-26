import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../../shared/Button/Button';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { useUser } from '../../../../shared/useUser/useUser';
import { TextInput } from '../../../../shared/TextInput/TextInput';
import { supabase } from '../../../../supabase';
import { changeEmailErrorMessage } from '../changeEmailErrorMessage/changeEmailErrorMessage';
import { CurrentEmail } from '../CurrentEmail/CurrentEmail';
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
      { emailRedirectTo: `${window.location.origin}/account/email` },
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
