import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../elements/Button';
import { ErrorMessage } from '../../elements/ErrorMessage';
import { TextInput } from '../../elements/TextInput';
import { supabase } from '../../supabase';
import { resetOutcome } from './elements/resetOutcome';
import type { ResetOutcome } from './elements/resetOutcome';
import './page.css';

export function ForgotPassword() {
  const [pending, setPending] = useState(false);
  const [outcome, setOutcome] = useState<ResetOutcome>();

  async function sendResetEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(
      String(form.get('email')),
      { redirectTo: `${window.location.origin}/set-new-password` },
    );
    setPending(false);
    setOutcome(resetOutcome(error));
  }

  return (
    <section className="forgot-password-card">
      <h1 className="forgot-password-heading">Forgot password</h1>
      {outcome === 'sent' ? (
        <p>If an account exists for that email, we've sent a reset link</p>
      ) : (
        <form className="forgot-password-form" onSubmit={sendResetEmail}>
          <TextInput
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
          />
          {outcome === 'failed' && (
            <ErrorMessage>Couldn't send reset email, try again</ErrorMessage>
          )}
          <Button disabled={pending}>Send reset link</Button>
        </form>
      )}
      <Link to="/sign-in" className="forgot-password-link">
        Back to sign in
      </Link>
    </section>
  );
}
