import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import {
  SERVER,
  saveButton,
  savePassword,
} from '../../../../tests-shared/newPasswordForm';
import { registerTestUser } from '../../../../tests-shared/testUser';
import { supabase } from '../../../../supabase';
import { ChangePasswordForm } from './ChangePasswordForm';

const changing = registerTestUser();
const confirming = registerTestUser();
const reauthenticating = registerTestUser();
const unsent = registerTestUser();

afterEach(() => {
  vi.restoreAllMocks();
});

const newPassword = () => `Aa1!${crypto.randomUUID()}`;

const field = (label: string) => screen.getByLabelText<HTMLInputElement>(label);

const changedNotice = () => screen.findByRole('status', {}, SERVER);

const updateBodies = (updates: ReturnType<typeof answerRequests>) =>
  updates.mock.calls
    .filter(([input, init]) => isPasswordUpdate(input, init))
    .map(([, init]) => JSON.parse(String(init?.body)) as object);

const isPasswordUpdate = (input: RequestInfo | URL, init?: RequestInit) =>
  String(input).endsWith('/user') && init?.method === 'PUT';

type Answer = (input: RequestInfo | URL, init?: RequestInit) => Response | null;

const askForReauthentication: Answer = (input, init) =>
  isPasswordUpdate(input, init)
    ? Response.json(
        {
          error_code: 'reauthentication_needed',
          msg: 'Password update requires reauthentication',
        },
        { status: 400 },
      )
    : null;

const failToSendCode: Answer = (input) =>
  String(input).endsWith('/reauthenticate')
    ? Response.json({ msg: 'Failed' }, { status: 500 })
    : null;

function once(answer: Answer): Answer {
  let answered = false;
  return (input, init) => {
    if (answered) return null;
    const response = answer(input, init);
    answered = response !== null;
    return response;
  };
}

function answerRequests(...answers: Answer[]) {
  const realFetch = window.fetch;
  // mock-reason: the server asks for reauthentication only from a session over
  // 24 hours old, which a test cannot make, and cannot be made to fail sending
  // the code on demand. Only the answered requests are faked; the rest are real.
  return vi.spyOn(window, 'fetch').mockImplementation((input, init) => {
    const answered = answers
      .map((answer) => answer(input, init))
      .find((response) => response !== null);
    return answered ? Promise.resolve(answered) : realFetch(input, init);
  });
}

it('changes the account password to the one submitted', async () => {
  // Given a signed-in user on the change password form
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
  await confirming.signIn();
  render(<ChangePasswordForm />);

  // When they save a password meeting every rule
  await savePassword(newPassword());

  // Then they are told it changed, and the form is empty for next time
  expect(await changedNotice()).toHaveTextContent('Password changed');
  expect(field('New password')).toHaveValue('');
  expect(field('Confirm new password')).toHaveValue('');
  expect(screen.queryAllByText('(done)')).toHaveLength(0);
  expect(screen.queryByText("Passwords don't match")).not.toBeInTheDocument();
});

it('asks for an emailed code when the server wants reauthentication', async () => {
  // Given a signed-in user whose session is too old to change the password
  await reauthenticating.signIn();
  render(<ChangePasswordForm />);
  const updates = answerRequests(once(askForReauthentication));

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
  expect(await changedNotice()).toHaveTextContent('Password changed');
  const [first, resubmission] = updateBodies(updates);
  expect(first).not.toHaveProperty('nonce');
  expect(resubmission).toMatchObject({ password, nonce: '123456' });
  expect(screen.queryByLabelText('Code')).not.toBeInTheDocument();
});

it('asks them to retry when the code cannot be sent', async () => {
  // Given a user asked to reauthenticate, and a server that fails to send the code
  await unsent.signIn();
  render(<ChangePasswordForm />);
  answerRequests(askForReauthentication, failToSendCode);

  // When they save a new password
  await savePassword(newPassword());

  // Then they are asked to try again, with no code field
  expect(await screen.findByRole('alert', {}, SERVER)).toHaveTextContent(
    "Couldn't set your password, try again",
  );
  expect(screen.queryByLabelText('Code')).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
