import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '../../elements/Button';
import { ErrorMessage } from '../../elements/ErrorMessage';
import { TextInput } from '../../elements/TextInput';
import { useUser } from '../../elements/session';
import { supabase } from '../../supabase';
import { CheckEmail } from './elements/CheckEmail';
import { PasswordChecklist } from './elements/PasswordChecklist';
import { signUpErrorMessage } from './elements/signUpErrorMessage';
import './page.css';

export function SignUp() {
  const user = useUser();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [signedUpEmail, setSignedUpEmail] = useState<string>();
  const [password, setPassword] = useState('');

  if (user) return <Navigate to="/" replace />;
  if (signedUpEmail) return <CheckEmail email={signedUpEmail} />;

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
    else setSignedUpEmail(email);
  }

  return (
    <section className="sign-up-card">
      <h1 className="sign-up-heading">Sign up</h1>
      <form className="sign-up-form" onSubmit={signUp}>
        <TextInput
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
        />
        <TextInput
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          onChange={setPassword}
        />
        <PasswordChecklist password={password} />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button disabled={pending}>Sign up</Button>
      </form>
      <p className="sign-up-switch">
        Have an account? <Link to="/sign-in">Sign in</Link>
      </p>
    </section>
  );
}
