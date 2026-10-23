import { act, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PASSWORDS_DIFFER_MESSAGE } from '../../../../../elements/ConfirmPasswordInput/ConfirmPasswordInput.constants';
import { TRY_AGAIN_MESSAGE } from '../../../../../shared/newPasswordErrorMessage/newPasswordErrorMessage.constants';
import { CHANGE_PASSWORD_ROUTE_PATH } from '../../router.constants';
import {
  SERVER,
  savePassword,
} from '../../../../../tests-shared/newPasswordForm';
import { pathOf, renderSettledAt } from '../../../../../tests-shared/renderAt';
import { createTestUser } from '../../../../../tests-shared/testUser';
import { supabase } from '../../../../../supabase';
import { CODE_SENT_MESSAGE } from '../../confirmation/elements/ReauthenticationCodeInput/ReauthenticationCodeInput.constants';
import {
  answerRequests,
  askForReauthentication,
  failToSendCode,
} from '../../tests-shared/reauthenticationRequests';
import { PASSWORD_CHANGED_MESSAGE } from '../../page.constants';

afterEach(() => {
  vi.restoreAllMocks();
});

const newPassword = () => `Aa1!${crypto.randomUUID()}`;

const field = (label: string) => screen.getByLabelText<HTMLInputElement>(label);

const changedNotice = () => screen.findByRole('status', {}, SERVER);

it('changes the account password to the one submitted', async () => {
  // Given a signed-in user on the change password form
  const changing = await createTestUser();
  await changing.signIn();
  await renderSettledAt(CHANGE_PASSWORD_ROUTE_PATH);
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
  await renderSettledAt(CHANGE_PASSWORD_ROUTE_PATH);

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
  await renderSettledAt(CHANGE_PASSWORD_ROUTE_PATH);
  await savePassword(unchangedPassword);
  await screen.findByRole('alert', {}, SERVER);

  // When they save a password meeting every rule
  await savePassword(newPassword());
  await changedNotice();

  // Then the refusal is gone
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('moves on to the code screen when the server wants reauthentication', async () => {
  // Given a signed-in user whose session is too old to change the password
  const reauthenticating = await createTestUser();
  await reauthenticating.signIn();
  const memoryRouter = await renderSettledAt(CHANGE_PASSWORD_ROUTE_PATH);
  answerRequests(askForReauthentication);

  // When they save a new password
  await savePassword(newPassword());

  // Then they are on the code screen, told a code was emailed
  expect(await screen.findByText(CODE_SENT_MESSAGE, {}, SERVER)).toBeVisible();
  expect(pathOf(memoryRouter)).toBe(
    `${CHANGE_PASSWORD_ROUTE_PATH}/confirmation`,
  );
  expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
});

it('asks them to retry when the code cannot be sent', async () => {
  // Given a user asked to reauthenticate, and a server that fails to send the code
  const unsent = await createTestUser();
  await unsent.signIn();
  const memoryRouter = await renderSettledAt(CHANGE_PASSWORD_ROUTE_PATH);
  answerRequests(askForReauthentication, failToSendCode);

  // When they save a new password
  await savePassword(newPassword());

  // Then they are asked to try again, and stay on the password form
  expect(await screen.findByRole('alert', {}, SERVER)).toHaveTextContent(
    TRY_AGAIN_MESSAGE,
  );
  expect(pathOf(memoryRouter)).toBe(CHANGE_PASSWORD_ROUTE_PATH);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
