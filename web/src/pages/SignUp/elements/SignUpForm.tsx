import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../elements/Button';
import { ErrorMessage } from '../../../elements/ErrorMessage';
import { PasswordChecklist } from '../../../elements/PasswordChecklist';
import { meetsEveryRule } from '../../../elements/passwordRules';
import { TextInput } from '../../../elements/TextInput';
import { supabase } from '../../../supabase';
import { signUpErrorMessage } from './signUpErrorMessage';
import './SignUpForm.css';

type SignUpFormProps = {
  onSignedUp: (email: string) => void;
};

export function SignUpForm({ onSignedUp }: SignUpFormProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState('');
  // The browser's own validity covers a well-formed email; the rules cover the
  // password. Sign up stays disabled until both hold.
  const [fieldsValid, setFieldsValid] = useState<boolean>();

  async function signUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email'));
    setPending(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: String(form.get('password')),
      options: { emailRedirectTo: window.location.origin },
    });
    setPending(false);
    if (error) setError(signUpErrorMessage(error));
    else onSignedUp(email);
  }

  return (
    <form
      className="sign-up-form"
      onSubmit={signUp}
      onChange={(event) => setFieldsValid(event.currentTarget.checkValidity())}
    >
      <TextInput label="Email" name="email" type="email" autoComplete="email" />
      <TextInput
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        onChange={setPassword}
      />
      <PasswordChecklist password={password} />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button disabled={pending || !fieldsValid || !meetsEveryRule(password)}>
        Sign up
      </Button>
    </form>
  );
}
