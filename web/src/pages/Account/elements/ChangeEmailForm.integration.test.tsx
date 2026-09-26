import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { renderSettledAt } from '../../../tests-shared/renderAt';
import { registerTestUser } from '../../../tests-shared/testUser';
import { supabase } from '../../../supabase';

// Separate users, as a requested change stays pending on the account.
const viewer = registerTestUser();
const requester = registerTestUser();
const returner = registerTestUser();
const taken = registerTestUser();

afterEach(() => {
  vi.restoreAllMocks();
});

const unusedEmail = () => `test-${crypto.randomUUID()}@example.test`;

const changeEmailButton = () =>
  screen.getByRole('button', { name: 'Change email' });

const enterNewEmail = (email: string) =>
  fireEvent.change(screen.getByLabelText('New email'), {
    target: { value: email },
  });

async function accountPageAs(
  user: ReturnType<typeof registerTestUser>,
  hash = '',
) {
  await user.signIn();
  return renderSettledAt(`/account${hash}`);
}

it('shows their current email and no pending change', async () => {
  // Given a signed-in user

  // When they open their account page
  await accountPageAs(viewer);

  // Then it shows the email they have, with nothing waiting
  expect(
    await screen.findByText(`Current email: ${viewer.credentials.email}`),
  ).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

it('asks them to check both inboxes once a change is requested', async () => {
  // Given a signed-in user on their account page
  await accountPageAs(requester);
  // mock-reason: the redirect is the assertion, and the test stack only honours
  // redirects on its allow list, which the test origin is not on, so the email
  // cannot show it. The spy still calls the real client.
  const updateUser = vi.spyOn(supabase.auth, 'updateUser');
  const newEmail = unusedEmail();

  // When they request a new email
  enterNewEmail(newEmail);
  fireEvent.click(changeEmailButton());

  // Then they are asked to confirm from both inboxes, landing back here
  expect(await screen.findByRole('status')).toHaveTextContent(
    `Check both inboxes to confirm the change to ${newEmail}`,
  );
  expect(updateUser).toHaveBeenCalledWith(
    { email: newEmail },
    { emailRedirectTo: `${window.location.origin}/account` },
  );
});

it('still shows a pending change when they come back', async () => {
  // Given a user who requested a change earlier
  await returner.signIn();
  const newEmail = unusedEmail();
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;

  // When they open their account page
  await renderSettledAt('/account');

  // Then the change is still waiting on both inboxes
  expect(await screen.findByRole('status')).toHaveTextContent(
    `Check both inboxes to confirm the change to ${newEmail}`,
  );
});

it('says when the new email already has an account', async () => {
  // Given a signed-in user on their account page
  await accountPageAs(viewer);

  // When they ask for an email another account uses
  enterNewEmail(taken.credentials.email);
  fireEvent.click(changeEmailButton());

  // Then they are told it is taken
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'That email is already in use',
  );
});

it('disables the button until the attempt finishes', async () => {
  // Given a signed-in user on their account page
  await accountPageAs(viewer);

  // When they submit a change the server refuses
  enterNewEmail(taken.credentials.email);
  fireEvent.click(changeEmailButton());

  // Then the button is disabled until the error shows
  expect(changeEmailButton()).toBeDisabled();
  await screen.findByRole('alert');
  expect(changeEmailButton()).toBeEnabled();
});

it('keeps the browser from submitting the form itself', async () => {
  // Given a signed-in user on their account page with a new email entered
  await accountPageAs(viewer);
  enterNewEmail(taken.credentials.email);

  // When the form is submitted
  const submitted = fireEvent.submit(changeEmailButton().closest('form')!);

  // Then the browser's own submission is cancelled
  expect(submitted).toBe(false);
  await screen.findByRole('alert');
});

it('keeps change email disabled until the new email is valid', async () => {
  // Given a signed-in user on their account page
  await accountPageAs(viewer);

  // When they type something that is not an email, then an email
  enterNewEmail('not-an-email');
  const disabledForInvalid = changeEmailButton().hasAttribute('disabled');
  enterNewEmail(unusedEmail());

  // Then the button only enables for the email
  expect(disabledForInvalid).toBe(true);
  expect(changeEmailButton()).toBeEnabled();
});

it('confirms the first link and clears it from the address', async () => {
  // Given a user back from the first of the two email links
  const memoryRouter = await accountPageAs(
    viewer,
    '#message=Confirmation+link+accepted',
  );

  // When they go back
  await act(() => memoryRouter.navigate(-1));

  // Then they were told to open the other link, and the hash is not in history
  expect(screen.getByRole('status')).toHaveTextContent(
    'Confirmed, now open the link sent to your other email',
  );
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(memoryRouter.state.location.hash).toBe('');
});

it('reports a link that failed', async () => {
  // Given a user back from an expired email link
  await accountPageAs(
    viewer,
    '#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
  );

  // Then they are told it failed
  expect(screen.getByRole('alert')).toHaveTextContent(
    'That link is invalid or has expired',
  );
});

it('leaves a hash that is not about an email link alone', async () => {
  // Given a signed-in user

  // When they open their account page with an unrelated hash
  const memoryRouter = await accountPageAs(viewer, '#section');

  // Then the hash stays
  expect(memoryRouter.state.location.hash).toBe('#section');
});
