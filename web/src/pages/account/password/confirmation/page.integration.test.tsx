import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { WRONG_CODE_MESSAGE } from '../../../../shared/newPasswordErrorMessage/newPasswordErrorMessage.constants';
import { CHANGE_PASSWORD_ROUTE_PATH } from '../router.constants';
import { SERVER, savePassword } from '../../../../tests-shared/newPasswordForm';
import { pathOf, renderSettledAt } from '../../../../tests-shared/renderAt';
import { createTestUser } from '../../../../tests-shared/testUser';
import { CODE_SENT_MESSAGE } from './elements/ReauthenticationCodeInput/ReauthenticationCodeInput.constants';
import {
  answerRequests,
  askForReauthentication,
  once,
  passwordUpdateBodies,
  rejectCode,
} from '../tests-shared/reauthenticationRequests';
import { PASSWORD_CHANGED_MESSAGE } from '../page.constants';

const CONFIRMATION_PATH = `${CHANGE_PASSWORD_ROUTE_PATH}/confirmation`;

afterEach(() => {
  vi.restoreAllMocks();
});

async function reachCodeScreen(password: string) {
  await renderSettledAt(CHANGE_PASSWORD_ROUTE_PATH);
  await savePassword(password);
  await screen.findByText(CODE_SENT_MESSAGE, {}, SERVER);
}

const confirmButton = () => screen.getByRole('button', { name: 'Confirm' });

function confirmWithCode(code: string) {
  fireEvent.change(screen.getByLabelText('Code'), { target: { value: code } });
  return fireEvent.submit(confirmButton().closest('form')!);
}

it('changes the password with the emailed code', async () => {
  // Given a user on the code screen after saving a new password
  const resubmitting = await createTestUser();
  await resubmitting.signIn();
  const fetches = answerRequests(once(askForReauthentication));
  const password = `Aa1!${crypto.randomUUID()}`;
  await reachCodeScreen(password);

  // When they confirm with the emailed code
  confirmWithCode('123456');

  // Then the new password goes with the code, and they are told it changed
  expect(await screen.findByRole('status', {}, SERVER)).toHaveTextContent(
    PASSWORD_CHANGED_MESSAGE,
  );
  const [first, resubmission] = passwordUpdateBodies(fetches);
  expect(first).not.toHaveProperty('nonce');
  expect(resubmission).toMatchObject({ password, nonce: '123456' });
  expect(screen.queryByLabelText('Code')).not.toBeInTheDocument();
});

it('explains a wrong code and lets them try again', async () => {
  // Given a user on the code screen, and a server that rejects their code
  const mistyping = await createTestUser();
  await mistyping.signIn();
  answerRequests(once(askForReauthentication), rejectCode);
  await reachCodeScreen(`Aa1!${crypto.randomUUID()}`);
  expect(confirmButton()).toBeEnabled();

  // When they confirm with a wrong code
  const submitted = confirmWithCode('000000');

  // Then the browser's own submission is cancelled and Confirm waits for the server
  expect(submitted).toBe(false);
  expect(confirmButton()).toBeDisabled();

  // And they are told, and can enter it again
  expect(await screen.findByRole('alert', {}, SERVER)).toHaveTextContent(
    WRONG_CODE_MESSAGE,
  );
  expect(screen.getByLabelText('Code')).toBeVisible();
  expect(confirmButton()).toBeEnabled();
});

it('sends them to the password form when opened without a new password', async () => {
  // Given a signed-in user
  const arriving = await createTestUser();
  await arriving.signIn();

  // When they open the code screen directly
  const memoryRouter = await renderSettledAt(CONFIRMATION_PATH);

  // Then they are on the password form instead
  await waitFor(() =>
    expect(pathOf(memoryRouter)).toBe(CHANGE_PASSWORD_ROUTE_PATH),
  );
  expect(
    await screen.findByLabelText('New password', {}, SERVER),
  ).toBeVisible();
});
