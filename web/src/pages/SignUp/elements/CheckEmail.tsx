import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from '../../../elements/Button';
import { ErrorMessage } from '../../../elements/ErrorMessage';
import { SuccessMessage } from '../../../elements/SuccessMessage';
import { supabase } from '../../../supabase';
import './CheckEmail.css';

type CheckEmailProps = {
  email: string;
};

export function CheckEmail({ email }: CheckEmailProps) {
  const [pending, setPending] = useState(false);
  const [resent, setResent] = useState<boolean>();

  async function resend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setPending(false);
    setResent(!error);
  }

  return (
    <section className="check-email-card">
      <h1 className="check-email-heading">Check your email</h1>
      <p>Follow the link we sent to {email} to finish signing up.</p>
      <form className="check-email-form" onSubmit={resend}>
        {resent === false && (
          <ErrorMessage>Couldn&apos;t resend, try again</ErrorMessage>
        )}
        {resent && <SuccessMessage>Sent again</SuccessMessage>}
        <Button disabled={pending}>Resend email</Button>
      </form>
    </section>
  );
}
