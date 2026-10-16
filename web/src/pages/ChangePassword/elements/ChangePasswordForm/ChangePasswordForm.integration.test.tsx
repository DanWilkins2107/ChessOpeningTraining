import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PASSWORDS_DIFFER_MESSAGE } from '../../../../elements/ConfirmPasswordInput/ConfirmPasswordInput.constants';
import { TRY_AGAIN_MESSAGE } from '../../../../elements/newPasswordErrorMessage/newPasswordErrorMessage.constants';
import { CODE_SENT_MESSAGE } from '../../../../elements/ReauthenticationCodeInput/ReauthenticationCodeInput.constants';
import {
  SERVER,
  saveButton,
  savePassword,
} from '../../../../tests-shared/newPasswordForm';
import { registerTestUser } from '../../../../tests-shared/testUser';
import { supabase } from '../../../../supabase';
import { ChangePasswordForm } from './ChangePasswordForm';
import { PASSWORD_CHANGED_MESSAGE } from './ChangePasswordForm.constants';

const changing = registerTestUser();
const clearing = registerTestUser();
const unchangedPassword = `Aa1!${crypto.randomUUID()}`;
const retrying = registerTestUser({ password: unchangedPassword });
const reauthenticating = registerTestUser();
const unsent = registerTestUser();

afterEach(() => {
  vi.restoreAllMocks();
});

const newPassword = () => `Aa1!${crypto.randomUUID()}`;

const field = (label: string) => screen.getByLabelText<HTMLInputElement>(label);

const changedNotice = () => screen.findByRole('status', {}, SERVER);

const isPasswordUpdate = (input: RequestInfo | URL, init?: RequestInit) =>
  String(input).endsWith('/user') && init?.method === 'PUT';

const updateBodies = (fetches: ReturnType<typeof answerRequests>) =>
  fetches.mock.calls
    .filter(([input, init]) => isPasswordUpdate(input, init))
    .map(([, init]) => JSON.parse(String(init?.body)));

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
  // mock-reason: the server asks for a code only from a session over a day old,
  // which a browser test cannot make, and cannot be made to fail sending one on
  // demand. Only the answered requests are faked; the rest are real.
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

it('asks for an emailed code when the server wants reauthentication', async () => {
  // Given a signed-in user whose session is too old to change the password
  await reauthenticating.signIn();
  render(<ChangePasswordForm />);
  const fetches = answerRequests(once(askForReauthentication));

  // When they save a new password, then resubmit with the emailed code
  const password = newPassword();
  await savePassword(password);
  expect(await screen.findByText(CODE_SENT_MESSAGE, {}, SERVER)).toBeVisible();
  fireEvent.change(field('Code'), { target: { value: '123456' } });
  fireEvent.click(await saveButton());

  // Then the code goes with the resubmission, and the code field is cleared away
  expect(await changedNotice()).toHaveTextContent(PASSWORD_CHANGED_MESSAGE);
  const [first, resubmission] = updateBodies(fetches);
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
    TRY_AGAIN_MESSAGE,
  );
  expect(screen.queryByLabelText('Code')).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
