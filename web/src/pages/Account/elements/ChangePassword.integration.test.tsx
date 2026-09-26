import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import {
  SERVER,
  saveButton,
  savePassword,
} from '../../../tests-shared/newPasswordForm';
import { registerTestUser } from '../../../tests-shared/testUser';
import { supabase } from '../../../supabase';
import { ChangePassword } from './ChangePassword';

const changing = registerTestUser();
const confirming = registerTestUser();
const reauthenticating = registerTestUser();
const unsent = registerTestUser();

afterEach(() => {
  vi.restoreAllMocks();
});

const newPassword = () => `Aa1!${crypto.randomUUID()}`;

const passwordField = () =>
  screen.getByLabelText<HTMLInputElement>('New password');

const confirmation = () => screen.findByRole('status', {}, SERVER);

const isPasswordUpdate = (input: RequestInfo | URL, init?: RequestInit) =>
  String(input).endsWith('/user') && init?.method === 'PUT';

const reauthenticationNeeded = () =>
  Response.json(
    {
      error_code: 'reauthentication_needed',
      msg: 'Password update requires reauthentication',
    },
    { status: 400 },
  );

type Answer = (input: RequestInfo | URL, init?: RequestInit) => Response | null;

function answerRequests(answer: Answer) {
  const realFetch = window.fetch;
  // mock-reason: the server asks for reauthentication only from a session over
  // 24 hours old, which a test cannot make, and cannot be made to fail sending
  // the code on demand. Only the answered requests are faked; the rest are real.
  return vi.spyOn(window, 'fetch').mockImplementation((input, init) => {
    const answered = answer(input, init);
    return answered ? Promise.resolve(answered) : realFetch(input, init);
  });
}

function askForReauthenticationOnce() {
  let asked = false;
  return answerRequests((input, init) => {
    if (asked || !isPasswordUpdate(input, init)) return null;
    asked = true;
    return reauthenticationNeeded();
  });
}

const failToSendCode = () =>
  answerRequests((input, init) => {
    if (isPasswordUpdate(input, init)) return reauthenticationNeeded();
    if (String(input).endsWith('/reauthenticate'))
      return Response.json({ msg: 'Failed' }, { status: 500 });
    return null;
  });

it('changes the account password to the one submitted', async () => {
  // Given a signed-in user on the change password form
  await changing.signIn();
  render(<ChangePassword />);
  const password = newPassword();

  // When they save a password meeting every rule
  await savePassword(password);
  await confirmation();

  // Then the account signs in with it
  const signedIn = await act(() =>
    supabase.auth.signInWithPassword({
      email: changing.credentials.email,
      password,
    }),
  );
  expect(signedIn.error).toBeNull();
});

it('confirms the change and clears the field', async () => {
  // Given a signed-in user on the change password form
  await confirming.signIn();
  render(<ChangePassword />);

  // When they save a password meeting every rule
  await savePassword(newPassword());

  // Then they are told it changed, and the field is empty for next time
  expect(await confirmation()).toHaveTextContent('Password changed');
  expect(passwordField()).toHaveValue('');
});

it('asks for an emailed code when the server wants reauthentication', async () => {
  // Given a signed-in user whose session is too old to change the password
  await reauthenticating.signIn();
  render(<ChangePassword />);
  const updates = askForReauthenticationOnce();

  // When they save a new password
  const password = newPassword();
  await savePassword(password);
  const code = await screen.findByLabelText('Code', {}, SERVER);

  // Then they are asked for the emailed code, which goes with the resubmission
  expect(
    screen.getByText("We've emailed you a code to confirm it's you"),
  ).toBeInTheDocument();
  fireEvent.change(code, { target: { value: '123456' } });
  fireEvent.click(await saveButton());
  expect(await confirmation()).toHaveTextContent('Password changed');
  const resubmission = updates.mock.calls.filter(([input, init]) =>
    isPasswordUpdate(input, init),
  )[1];
  expect(JSON.parse(String(resubmission[1]?.body))).toMatchObject({
    password,
    nonce: '123456',
  });
});

it('asks them to retry when the code cannot be sent', async () => {
  // Given a user asked to reauthenticate, and a server that fails to send the code
  await unsent.signIn();
  render(<ChangePassword />);
  failToSendCode();

  // When they save a new password
  await savePassword(newPassword());

  // Then they are asked to try again, with no code field
  expect(await screen.findByRole('alert', {}, SERVER)).toHaveTextContent(
    "Couldn't set your password, try again",
  );
  expect(screen.queryByLabelText('Code')).not.toBeInTheDocument();
});
