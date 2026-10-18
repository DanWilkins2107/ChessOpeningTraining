import { act, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { PASSWORDS_DIFFER_MESSAGE } from '../../../../elements/ConfirmPasswordInput/ConfirmPasswordInput.constants';
import { SERVER, savePassword } from '../../../../tests-shared/newPasswordForm';
import { createTestUser } from '../../../../tests-shared/testUser';
import { supabase } from '../../../../supabase';
import { ChangePasswordForm } from './ChangePasswordForm';
import { PASSWORD_CHANGED_MESSAGE } from './ChangePasswordForm.constants';

const newPassword = () => `Aa1!${crypto.randomUUID()}`;

const field = (label: string) => screen.getByLabelText<HTMLInputElement>(label);

const changedNotice = () => screen.findByRole('status', {}, SERVER);

it('changes the account password to the one submitted', async () => {
  // Given a signed-in user on the change password form
  const changing = await createTestUser();
  await changing.signIn();
  render(<ChangePasswordForm />);
  const password = newPassword();

  // When they save a password meeting every rule
  await savePassword(password);
  await changedNotice();

  // Then the account signs in with it
  const signedIn = await act(() =>
    supabase.auth.signInWithPassword({
      email: changing.credentials.email,
      password,
    }),
  );
  expect(signedIn.error).toBeNull();
});

it('confirms the change and clears the fields', async () => {
  // Given a signed-in user on the change password form
  const clearing = await createTestUser();
  await clearing.signIn();
  render(<ChangePasswordForm />);

  // When they save a password meeting every rule
  await savePassword(newPassword());

  // Then they are told it changed, and the form is empty for next time
  expect(await changedNotice()).toHaveTextContent(PASSWORD_CHANGED_MESSAGE);
  expect(field('New password')).toHaveValue('');
  expect(field('Confirm new password')).toHaveValue('');
  expect(screen.queryAllByText('(done)')).toHaveLength(0);
  expect(screen.queryByText(PASSWORDS_DIFFER_MESSAGE)).not.toBeInTheDocument();
});

it('drops an earlier error once the change goes through', async () => {
  // Given a user whose first attempt was refused
  const unchangedPassword = newPassword();
  const retrying = await createTestUser({ password: unchangedPassword });
  await retrying.signIn();
  render(<ChangePasswordForm />);
  await savePassword(unchangedPassword);
  await screen.findByRole('alert', {}, SERVER);

  // When they save a password meeting every rule
  await savePassword(newPassword());
  await changedNotice();

  // Then the refusal is gone
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
