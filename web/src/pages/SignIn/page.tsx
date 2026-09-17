import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../elements/Button';
import { ErrorMessage } from '../../elements/ErrorMessage';
import { useUser } from '../../elements/session';
import { TextInput } from '../../elements/TextInput';
import { supabase } from '../../supabase';
import { safeReturnPath } from './elements/safeReturnPath';
import { signInErrorMessage } from './elements/signInErrorMessage';
import { SignOutNotice } from './elements/SignOutNotice';
import {
  signOutNotice,
  signOutOutcome,
  withoutSignOutNotice,
} from './elements/signOutOutcome';
import './page.css';

// A signed-in visitor has no business on the form and is sent on, unless they
// have just signed out here: signing out lands them on this page before the
// session has finished clearing, and bouncing them would lose the notice.
const sendsUserOn = (
  user: ReturnType<typeof useUser>,
  outcome: string | null,
) => Boolean(user) && signOutNotice(outcome) === undefined;

export function SignIn() {
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  // Both inputs are required, so the browser's validity means a well-formed
  // email and a non-empty password. Sign in stays disabled until then.
  const [fieldsValid, setFieldsValid] = useState<boolean>();

  const outcome = signOutOutcome(searchParams);

  if (sendsUserOn(user, outcome)) {
    return <Navigate to={safeReturnPath(searchParams.get('next'))} replace />;
  }

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSearchParams(withoutSignOutNotice, { replace: true });
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
      <SignOutNotice outcome={outcome} />
      <form
        className="sign-in-form"
        onSubmit={signIn}
        onChange={(event) =>
          setFieldsValid(event.currentTarget.checkValidity())
        }
      >
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
        <Button disabled={pending || !fieldsValid}>Sign in</Button>
      </form>
      <Link to="/forgot-password" className="sign-in-link">
        Forgot password?
      </Link>
      <p className="sign-in-switch">
        No account? <Link to="/sign-up">Sign up</Link>
      </p>
    </section>
  );
}
