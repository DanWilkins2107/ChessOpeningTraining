import { act, fireEvent, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';
import { authSettled } from '../../tests-shared/authSettled';
import { pathOf, renderAt, renderSettledAt } from '../../tests-shared/renderAt';
import { registerTestUser } from '../../tests-shared/testUser';
import { supabase } from '../../supabase';

const currentPassword = `Aa1!${crypto.randomUUID()}`;

const recovering = registerTestUser();
const landing = registerTestUser();
const returning = registerTestUser();
const rejecting = registerTestUser({ password: currentPassword });

// Every wait here is on the test stack, and saving makes it hash the password,
// which outlasts Testing Library's default one-second wait.
const SERVER = { timeout: 3000 };

const spentNotice = () =>
  screen.findByText('That reset link is invalid or has expired', {}, SERVER);

const ruleList = () =>
  screen.findByRole('list', { name: 'Password needs' }, SERVER);

const saveButton = () =>
  screen.findByRole('button', { name: 'Save password' }, SERVER);

const atHome = () =>
  screen.findByRole('heading', { name: 'Chess Opening Training' }, SERVER);

const rejection = () => screen.findByRole('alert', {}, SERVER);

const tickedRules = async () =>
  within(await ruleList())
    .getAllByRole('listitem')
    .map((item) => item.textContent)
    .filter((text) => text?.endsWith('(done)'));

async function enterNewPassword(password: string) {
  fireEvent.change(await screen.findByLabelText('New password', {}, SERVER), {
    target: { value: password },
  });
}

async function savePassword(password: string) {
  await enterNewPassword(password);
  fireEvent.click(await saveButton());
}

it('says it is checking the link while the session resolves', () => {
  // Given a visitor arriving from a recovery link

  // When set new password opens, before the session resolves
  renderAt('/set-new-password');

  // Then it says it is checking
  expect(screen.getByText('Checking your reset link')).toBeInTheDocument();
});

it('stops saying it is checking once the session resolves', async () => {
  // Given a visitor on set new password

  // When the session resolves to none
  await renderSettledAt('/set-new-password');
  await spentNotice();

  // Then it no longer says it is checking
  expect(
    screen.queryByText('Checking your reset link'),
  ).not.toBeInTheDocument();
});

it('is open to a visitor with no session', async () => {
  // Given a visitor whose recovery link gave them no session

  // When they open set new password
  const memoryRouter = await renderSettledAt('/set-new-password');

  // Then they stay on it
  expect(pathOf(memoryRouter)).toBe('/set-new-password');
});

it('tells a visitor with no session that the link is spent', async () => {
  // Given a visitor whose recovery link gave them no session

  // When they open set new password
  await renderSettledAt('/set-new-password');

  // Then they are told the link is no good
  expect(await spentNotice()).toBeInTheDocument();
});

it('offers no password form to a visitor with no session', async () => {
  // Given a visitor whose recovery link gave them no session

  // When they open set new password
  await renderSettledAt('/set-new-password');
  await spentNotice();

  // Then there is nothing to submit
  expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
});

it('sends a visitor with no session back for a fresh link', async () => {
  // Given a visitor told their link is spent
  await renderSettledAt('/set-new-password');

  // When they look for a way to get another
  const link = await screen.findByRole(
    'link',
    { name: 'Request a new link' },
    SERVER,
  );

  // Then it points at forgot password
  expect(link).toHaveAttribute('href', '/forgot-password');
});

it('shows the password rules to a user with a session', async () => {
  // Given a user whose recovery link signed them in
  await rejecting.signIn();

  // When they open set new password
  await renderSettledAt('/set-new-password');

  // Then the rules their password must meet are listed
  expect(await ruleList()).toBeInTheDocument();
});

it('tells a user with a session nothing about a spent link', async () => {
  // Given a user whose recovery link signed them in
  await rejecting.signIn();

  // When they open set new password
  await renderSettledAt('/set-new-password');
  await ruleList();

  // Then the spent-link notice is not there
  expect(
    screen.queryByText('That reset link is invalid or has expired'),
  ).not.toBeInTheDocument();
});

it('opens the form with every rule still to meet', async () => {
  // Given a user whose recovery link signed them in
  await rejecting.signIn();

  // When they open set new password
  await renderSettledAt('/set-new-password');

  // Then no rule is ticked off for them
  expect(await tickedRules()).toEqual([]);
});

it('keeps save disabled while the password misses a rule', async () => {
  // Given a user on set new password
  await rejecting.signIn();
  await renderSettledAt('/set-new-password');

  // When they enter a password missing a rule
  await enterNewPassword('Abcdefg1');

  // Then they cannot save it
  expect(await saveButton()).toBeDisabled();
});

it('enables save once the password meets every rule', async () => {
  // Given a user on set new password
  await rejecting.signIn();
  await renderSettledAt('/set-new-password');

  // When they enter a password meeting every rule
  await enterNewPassword(currentPassword);

  // Then they can save it
  expect(await saveButton()).toBeEnabled();
});

it('changes the account password to the one submitted', async () => {
  // Given a user on set new password
  await recovering.signIn();
  await renderSettledAt('/set-new-password');
  const newPassword = `Aa1!${crypto.randomUUID()}`;

  // When they save a password meeting every rule
  await savePassword(newPassword);
  await atHome();

  // Then the account signs in with it
  const signedIn = await act(() =>
    supabase.auth.signInWithPassword({
      email: recovering.credentials.email,
      password: newPassword,
    }),
  );
  expect(signedIn.error).toBeNull();
});

it('sends them home once the password is saved', async () => {
  // Given a user on set new password
  await landing.signIn();
  const memoryRouter = await renderSettledAt('/set-new-password');

  // When they save a password meeting every rule
  await savePassword(`Aa1!${crypto.randomUUID()}`);
  await atHome();

  // Then they are home
  expect(pathOf(memoryRouter)).toBe('/');
});

it('leaves the spent reset link out of history', async () => {
  // Given a user who saved a new password from set new password
  await returning.signIn();
  const memoryRouter = renderAt('/elsewhere', '/set-new-password');
  await authSettled();
  await savePassword(`Aa1!${crypto.randomUUID()}`);
  await atHome();

  // When they go back
  await act(() => memoryRouter.navigate(-1));

  // Then they land where they were before it
  expect(pathOf(memoryRouter)).toBe('/elsewhere');
});

it('shows the server message for a password the account already has', async () => {
  // Given a user on set new password
  await rejecting.signIn();
  await renderSettledAt('/set-new-password');

  // When they save the password they already have
  await savePassword(currentPassword);

  // Then the server's reason is shown
  expect(await rejection()).toHaveTextContent(/^New password should /);
});

it('disables the button until the attempt finishes', async () => {
  // Given a user on set new password
  await rejecting.signIn();
  await renderSettledAt('/set-new-password');

  // When they save the password they already have
  await savePassword(currentPassword);

  // Then the button is disabled until the error shows
  expect(await saveButton()).toBeDisabled();
  await rejection();
  expect(await saveButton()).toBeEnabled();
});

it('gives an error without the browser submitting the form', async () => {
  // Given a user on set new password
  await rejecting.signIn();
  await renderSettledAt('/set-new-password');

  // When the empty form is submitted
  const submitted = fireEvent.submit((await saveButton()).closest('form')!);

  // Then the browser's own submission is cancelled
  expect(submitted).toBe(false);
  await rejection();
});

// Last of this user's tests: the server accepting the password would leave them
// with a different one than the rest expect.
it('shows the server message for a password missing a rule', async () => {
  // Given a user on set new password
  await rejecting.signIn();
  await renderSettledAt('/set-new-password');

  // When a password the checklist rejects is submitted anyway, as it would be
  // if the checklist drifted from the server
  await enterNewPassword('Abcdefg1');
  fireEvent.submit((await saveButton()).closest('form')!);

  // Then the server refuses it too, and its reason is shown
  expect(await rejection()).toHaveTextContent(/^Password should /);
});
