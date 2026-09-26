import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../elements/Button';
import { ErrorMessage } from '../../../elements/ErrorMessage';
import {
  SIGNED_OUT_ACCOUNT_DELETED,
  SIGNED_OUT_PARAM,
} from '../../../elements/signOut.constants';
import { TextInput } from '../../../elements/TextInput';
import { supabase } from '../../../supabase';
import { deleteAccountErrorMessage } from './deleteAccountErrorMessage';
import './DeleteAccount.css';

export function DeleteAccount() {
  const navigate = useNavigate();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [password, setPassword] = useState('');

  function fail(error: { code?: string }) {
    setPending(false);
    setError(deleteAccountErrorMessage(error));
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    const { data } = await supabase.auth.getSession();
    // Signing in again stamps the session with a fresh password entry, which
    // delete_own_account requires.
    const confirmed = await supabase.auth.signInWithPassword({
      email: data.session!.user.email!,
      password,
    });
    if (confirmed.error) return fail(confirmed.error);
    const deleted = await supabase.rpc('delete_own_account');
    if (deleted.error) return fail(deleted.error);

    // Leaving first, as Sign out does, so ProtectedLayout's redirect can't win.
    await navigate(
      `/sign-in?${SIGNED_OUT_PARAM}=${SIGNED_OUT_ACCOUNT_DELETED}`,
      { replace: true },
    );
    // The account's sessions went with it, so no scope is needed, unlike Sign out.
    await supabase.auth.signOut();
  }

  return (
    <form className="delete-account" onSubmit={deleteAccount}>
      <h2 className="delete-account-heading">Delete account</h2>
      <p>This permanently deletes your account and all your studies.</p>
      <TextInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        onChange={setPassword}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <Button danger disabled={pending || !password}>
        Delete account
      </Button>
    </form>
  );
}
