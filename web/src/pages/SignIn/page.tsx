import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../elements/Button';
import { ErrorMessage } from '../../elements/ErrorMessage';
import { TextInput } from '../../elements/TextInput';
import { useUser } from '../../elements/session';
import { supabase } from '../../supabase';
import { safeReturnPath } from './elements/safeReturnPath';
import { signInErrorMessage } from './elements/signInErrorMessage';
import './page.css';

export function SignIn() {
  const user = useUser();
  const [searchParams] = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  if (user) {
    return <Navigate to={safeReturnPath(searchParams.get('next'))} replace />;
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get('email')),
      password: String(form.get('password')),
    });
    setPending(false);
    if (error) setError(signInErrorMessage(error));
  }

  return (
    <section className="sign-in-card">
      <h1 className="sign-in-heading">Sign in</h1>
      <form className="sign-in-form" onSubmit={signIn}>
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
          autoComplete="current-password"
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <Button disabled={pending}>Sign in</Button>
      </form>
      <p className="sign-in-switch">
        No account? <Link to="/sign-up">Sign up</Link>
      </p>
    </section>
  );
}
