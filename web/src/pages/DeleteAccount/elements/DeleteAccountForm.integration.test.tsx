import { fireEvent, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { pathOf, renderSettledAt } from '../../../tests-shared/renderAt';
import { registerTestUser } from '../../../tests-shared/testUser';
import { supabase } from '../../../supabase';

const keeping = registerTestUser();
const deleting = registerTestUser({ deletedByTest: true });
const noticed = registerTestUser({ deletedByTest: true });
const leaving = registerTestUser({ deletedByTest: true });
const goingBack = registerTestUser({ deletedByTest: true });

// Confirming re-hashes the password on the test stack, which outlasts Testing
// Library's default one-second wait.
const HASHING_WAIT = { timeout: 3000 };

afterEach(() => {
  vi.restoreAllMocks();
});

const deleteButton = () =>
  screen.findByRole('button', { name: 'Delete account' }, HASHING_WAIT);

async function deleteWith(password: string) {
  fireEvent.change(await screen.findByLabelText('Password', {}, HASHING_WAIT), {
    target: { value: password },
  });
  fireEvent.click(await deleteButton());
}

const refusal = () => screen.findByRole('alert', {}, HASHING_WAIT);

const deletedNotice = () =>
  vi.waitFor(
    () =>
      expect(screen.getByRole('status')).toHaveTextContent('Account deleted'),
    HASHING_WAIT,
  );

// The notice shows as soon as the page is left, before this device's session
// has finished clearing.
const signedOut = () =>
  vi.waitFor(async () => {
    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeNull();
  }, HASHING_WAIT);

async function signedInOnDeletePage(user: ReturnType<typeof registerTestUser>) {
  await user.signIn();
  return renderSettledAt('/account/delete');
}

function failTheDeleteRequest() {
  const realFetch = window.fetch;
  // mock-reason: the test stack cannot be made to fail the delete on demand.
  // Only that request is failed; everything else is real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    String(input).includes('/rpc/delete_own_account')
      ? Promise.resolve(Response.json({ code: '500' }, { status: 500 }))
      : realFetch(input, init),
  );
}

it('keeps delete disabled until a password is entered', async () => {
  // Given a signed-in user

  // When they open the delete account page
  await signedInOnDeletePage(keeping);

  // Then they cannot delete yet
  expect(await deleteButton()).toBeDisabled();
});

it('refuses a wrong password and keeps the account', async () => {
  // Given a signed-in user on their delete account page
  const memoryRouter = await signedInOnDeletePage(keeping);

  // When they confirm with the wrong password
  await deleteWith('not-their-password');

  // Then they are told, and stay signed in on their delete account page
  expect(await refusal()).toHaveTextContent('Incorrect password');
  expect(pathOf(memoryRouter)).toBe('/account/delete');
});

it('disables delete until the attempt finishes', async () => {
  // Given a signed-in user on their delete account page
  await signedInOnDeletePage(keeping);

  // When they confirm with the wrong password
  await deleteWith('not-their-password');

  // Then the button is disabled until the error shows
  expect(await deleteButton()).toBeDisabled();
  await refusal();
  expect(await deleteButton()).toBeEnabled();
});

it('says so when the server fails to delete the account', async () => {
  // Given a signed-in user, and a server that fails the delete
  await signedInOnDeletePage(keeping);
  failTheDeleteRequest();

  // When they confirm with their password
  await deleteWith(keeping.credentials.password);

  // Then they are asked to try again
  expect(await refusal()).toHaveTextContent(
    "Couldn't delete your account, try again",
  );
});

it('gives an error without the browser submitting the form', async () => {
  // Given a signed-in user on their delete account page
  await signedInOnDeletePage(keeping);

  // When the empty form is submitted
  const submitted = fireEvent.submit((await deleteButton()).closest('form')!);

  // Then the browser's own submission is cancelled
  expect(submitted).toBe(false);
  await refusal();
});

it('deletes the account', async () => {
  // Given a signed-in user on their delete account page
  await signedInOnDeletePage(deleting);

  // When they confirm with their password
  await deleteWith(deleting.credentials.password);
  await deletedNotice();
  await signedOut();

  // Then the account no longer signs in
  const { error } = await supabase.auth.signInWithPassword(
    deleting.credentials,
  );
  expect(error?.code).toBe('invalid_credentials');
});

it('says the account was deleted on the sign-in page', async () => {
  // Given a signed-in user on their delete account page
  const memoryRouter = await signedInOnDeletePage(noticed);

  // When they confirm with their password
  await deleteWith(noticed.credentials.password);

  // Then the sign-in page says so
  await deletedNotice();
  expect(pathOf(memoryRouter)).toBe('/sign-in?signedOut=accountDeleted');
});

it('signs them out', async () => {
  // Given a signed-in user on their delete account page
  await signedInOnDeletePage(leaving);

  // When they confirm with their password
  await deleteWith(leaving.credentials.password);

  // Then this device's session is gone
  await signedOut();
});

it('leaves no way back to the delete account page', async () => {
  // Given a user who deleted their account
  const memoryRouter = await signedInOnDeletePage(goingBack);
  await deleteWith(goingBack.credentials.password);
  await deletedNotice();
  await signedOut();

  // When they go back
  await memoryRouter.navigate(-1);

  // Then the delete account page is not in their history
  expect(pathOf(memoryRouter)).not.toBe('/account/delete');
});
