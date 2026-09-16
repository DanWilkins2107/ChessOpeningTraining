import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { registerTestUser } from '../../../tests-shared/testUser';
import { supabase } from '../../../supabase';
import { CheckEmail } from './CheckEmail';

// Separate accounts, because the server refuses a second resend to one email
// within a second.
const resentTo = registerTestUser({ emailConfirmed: false });
const pendingFor = registerTestUser({ emailConfirmed: false });

afterEach(() => {
  vi.restoreAllMocks();
});

const resendButton = () => screen.getByRole('button', { name: 'Resend email' });

it('shows the email the link was sent to', () => {
  // Given an email that was signed up
  const { email } = resentTo.credentials;

  // When the page renders
  render(<CheckEmail email={email} />);

  // Then it names that email
  expect(screen.getByText(email, { exact: false })).toBeInTheDocument();
});

it('resends the link back to this site', async () => {
  // Given the check email page for an unconfirmed account
  const { email } = resentTo.credentials;
  render(<CheckEmail email={email} />);
  // mock-reason: the redirect is the assertion, and the test stack only honours
  // redirects on its allow list, which the test origin is not on, so the email
  // cannot show it. The spy still calls the real client.
  const resend = vi.spyOn(supabase.auth, 'resend');

  // When they resend
  fireEvent.click(resendButton());

  // Then it says it was sent again, with the link returning to this site
  expect(await screen.findByRole('status')).toHaveTextContent('Sent again');
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(resend).toHaveBeenCalledWith({
    type: 'signup',
    email,
    options: { emailRedirectTo: window.location.origin },
  });
});

it('disables the button until the resend finishes', async () => {
  // Given the check email page
  render(<CheckEmail email={pendingFor.credentials.email} />);

  // When the form is submitted
  const submitted = fireEvent.submit(resendButton().closest('form')!);

  // Then the browser's own submission is cancelled, and the button is disabled
  // until the resend finishes
  expect(submitted).toBe(false);
  expect(resendButton()).toBeDisabled();
  await screen.findByRole('status');
  expect(resendButton()).toBeEnabled();
});

it('asks them to retry when the resend fails', async () => {
  // Given the check email page, and a server that fails the resend
  render(<CheckEmail email={pendingFor.credentials.email} />);
  const realFetch = window.fetch;
  // mock-reason: the local auth server cannot be made to fail a resend on
  // demand. Only the resend request is failed; everything else is real.
  vi.spyOn(window, 'fetch').mockImplementation((input, init) =>
    String(input).includes('/resend')
      ? Promise.resolve(Response.json({ msg: 'Failed' }, { status: 500 }))
      : realFetch(input, init),
  );

  // When they resend
  fireEvent.click(resendButton());

  // Then they are asked to try again
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't resend, try again",
  );
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
