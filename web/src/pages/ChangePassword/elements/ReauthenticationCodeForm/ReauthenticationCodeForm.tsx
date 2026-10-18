// fallow-ignore-file unused-file -- a65315e5 2026-11-17 landed ahead of the code screen, its first consumer.
import type { FormEvent } from 'react';
import { Button } from '../../../../shared/Button/Button';
import { ErrorMessage } from '../../../../shared/ErrorMessage/ErrorMessage';
import { ReauthenticationCodeInput } from '../ReauthenticationCodeInput/ReauthenticationCodeInput';
import './ReauthenticationCodeForm.css';

type ReauthenticationCodeFormProps = {
  pending: boolean;
  error?: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => unknown;
};

export function ReauthenticationCodeForm({
  pending,
  error,
  onSubmit,
}: ReauthenticationCodeFormProps) {
  return (
    <form className="reauthentication-code-form" onSubmit={onSubmit}>
      <ReauthenticationCodeInput />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button disabled={pending}>Confirm</Button>
    </form>
  );
}
