import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useUser } from '../../shared/session/session';
import { CheckEmail } from './elements/CheckEmail/CheckEmail';
import { SignUpForm } from './elements/SignUpForm/SignUpForm';
import './page.css';

export function SignUp() {
  const user = useUser();
  const [signedUpEmail, setSignedUpEmail] = useState<string>();

  if (user) return <Navigate to="/" replace />;
  if (signedUpEmail) return <CheckEmail email={signedUpEmail} />;

  return (
    <section className="sign-up-card">
      <h1 className="sign-up-heading">Sign up</h1>
      <SignUpForm onSignedUp={setSignedUpEmail} />
      <p className="sign-up-switch">
        Have an account? <Link to="/sign-in">Sign in</Link>
      </p>
    </section>
  );
}
