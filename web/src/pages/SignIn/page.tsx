import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../shared/Button/Button';
import { ErrorMessage } from '../../shared/ErrorMessage/ErrorMessage';
import { useUser } from '../../shared/useUser/useUser';
import { SuccessMessage } from '../../shared/SuccessMessage/SuccessMessage';
import { TextInput } from '../../shared/TextInput/TextInput';
import { supabase } from '../../supabase';
import { safeReturnPath } from './elements/safeReturnPath/safeReturnPath';
import { signInErrorMessage } from './elements/signInErrorMessage/signInErrorMessage';
import { signOutNotice } from './elements/signOutNotice/signOutNotice';
import { withoutSignOutNotice } from './elements/withoutSignOutNotice/withoutSignOutNotice';
import './page.css';

// A signed-in visitor has no business on the form and is sent on, unless they
// have just signed out here: signing out lands them on this page before the
// session has finished clearing, and bouncing them would lose the notice.
const sendsUserOn = (
  user: ReturnType<typeof useUser>,
  notice: string | undefined,
) => Boolean(user) && notice === undefined;

// Both inputs are required, so the browser's validity means a well-formed
// email and a non-empty password. Sign in stays disabled until then.
const cannotSubmit = (pending: boolean, fieldsValid: boolean | undefined) =>
  pending || !fieldsValid;

export function SignIn() {
  const user = useUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [fieldsValid, setFieldsValid] = useState<boolean>();

  const notice = signOutNotice(searchParams);

  if (sendsUserOn(user, notice)) {
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
      <form
        className="sign-in-form"
        onSubmit={signIn}
        onChange={(event) =>
          setFieldsValid(event.currentTarget.checkValidity())
        }
      >
        {/* Inside the form so the column's gap spaces it like the error. */}
        {notice && <SuccessMessage>{notice}</SuccessMessage>}
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
        <Button disabled={cannotSubmit(pending, fieldsValid)}>Sign in</Button>
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
