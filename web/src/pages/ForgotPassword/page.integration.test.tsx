import { fireEvent, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { authSettled } from '../../tests-shared/authSettled';
import { pathOf, renderAt } from '../../tests-shared/renderAt';
import { supabase } from '../../supabase';

afterEach(() => vi.restoreAllMocks());

const sendButton = () =>
  screen.getByRole('button', { name: 'Send reset link' });

const unknownEmail = () => `nobody-${crypto.randomUUID()}@example.test`;

function submit(email: string) {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: email },
  });
  fireEvent.click(sendButton());
}

it('is open to a signed-out visitor', async () => {
  // Given a signed-out visitor

  // When they open forgot password
  const memoryRouter = renderAt('/forgot-password');
  await authSettled();

  // Then they stay on it
  expect(pathOf(memoryRouter)).toBe('/forgot-password');
  expect(
    screen.getByRole('heading', { name: 'Forgot password' }),
  ).toBeInTheDocument();
});

it('shows no error before anything has been sent', async () => {
  // Given a visitor on forgot password

  // When they have not submitted yet
  renderAt('/forgot-password');
  await authSettled();

  // Then nothing is flagged as wrong
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('replaces the form with a confirmation once sent', async () => {
  // Given a visitor on forgot password
  renderAt('/forgot-password');
  await authSettled();

  // When they submit an email
  submit(unknownEmail());

  // Then the form is replaced by a confirmation that does not reveal the account
  expect(
    await screen.findByText(
      "If an account exists for that email, we've sent a reset link",
    ),
  ).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
});

it('links the reset email to set new password', async () => {
  // Given a visitor on forgot password
  renderAt('/forgot-password');
  await authSettled();
  // mock-reason: the link is only in the email, and the test stack sends none.
  // The spy still calls the real client.
  const sendReset = vi.spyOn(supabase.auth, 'resetPasswordForEmail');

  // When they submit an email
  const email = unknownEmail();
  submit(email);

  // Then the reset link points at set new password
  expect(sendReset).toHaveBeenCalledWith(email, {
    redirectTo: `${window.location.origin}/set-new-password`,
  });
  await screen.findByText(
    "If an account exists for that email, we've sent a reset link",
  );
});

it('shows a generic error when sending fails, without the browser submitting', async () => {
  // Given a visitor on forgot password
  renderAt('/forgot-password');
  await authSettled();

  // When the form is submitted without a valid email
  const submitted = fireEvent.submit(sendButton().closest('form')!);

  // Then the browser's own submission is cancelled and a generic error shows
  expect(submitted).toBe(false);
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't send reset email, try again",
  );
});

it('disables the button until the attempt finishes', async () => {
  // Given a visitor on forgot password
  renderAt('/forgot-password');
  await authSettled();

  // When the form is submitted
  fireEvent.submit(sendButton().closest('form')!);

  // Then the button is disabled until the error shows
  expect(sendButton()).toBeDisabled();
  await screen.findByRole('alert');
  expect(sendButton()).toBeEnabled();
});

it('links back to sign in', async () => {
  // Given a visitor on forgot password
  const memoryRouter = renderAt('/forgot-password');
  await authSettled();

  // When they follow the link back
  fireEvent.click(screen.getByRole('link', { name: 'Back to sign in' }));

  // Then they are at sign in
  expect(pathOf(memoryRouter)).toBe('/sign-in');
});
