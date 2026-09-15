import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { authSettled } from '../../tests-shared/authSettled';
import {
  registerSignUpEmail,
  registerTestUser,
} from '../../tests-shared/testUser';
import { router } from '../../elements/router';
import { supabase } from '../../supabase';

const existing = registerTestUser();
const newEmail = registerSignUpEmail();
const strongPassword = crypto.randomUUID();

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderAt(...entries: string[]) {
  const memoryRouter = createMemoryRouter(router.routes, {
    initialEntries: entries,
  });
  render(<RouterProvider router={memoryRouter} />);
  return memoryRouter;
}

const pathOf = ({ state }: ReturnType<typeof renderAt>) =>
  state.location.pathname + state.location.search;

const signUpButton = () => screen.getByRole('button', { name: 'Sign up' });

function submit(details: { email: string; password: string }) {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: details.email },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: details.password },
  });
  fireEvent.click(signUpButton());
}

async function renderSignedOut() {
  const memoryRouter = renderAt('/sign-up');
  await authSettled();
  return memoryRouter;
}

it('sends a signed-in user home', async () => {
  // Given a signed-in user
  await existing.signIn();

  // When they open sign up and the user loads
  const memoryRouter = renderAt('/sign-up');
  await authSettled();

  // Then they are home
  expect(pathOf(memoryRouter)).toBe('/');
});

it('leaves sign up out of history when sending a signed-in user home', async () => {
  // Given a signed-in user sent home from sign up
  await existing.signIn();
  const memoryRouter = renderAt('/elsewhere', '/sign-up');
  await authSettled();

  // When they go back
  await act(() => memoryRouter.navigate(-1));

  // Then they land where they were before it
  expect(pathOf(memoryRouter)).toBe('/elsewhere');
});

it('signs up a new email and asks them to check it', async () => {
  // Given a signed-out visitor on sign up
  await renderSignedOut();
  // mock-reason: the redirect is the assertion, and the test stack only honours
  // redirects on its allow list, which the test origin is not on, so the email
  // cannot show it. The spy still calls the real client.
  const signUp = vi.spyOn(supabase.auth, 'signUp');

  // When they submit a new email and a strong password
  submit({ email: newEmail, password: strongPassword });

  // Then they are asked to check that email, whose link returns to this site
  expect(
    await screen.findByRole('heading', { name: 'Check your email' }),
  ).toBeInTheDocument();
  expect(screen.getByText(newEmail, { exact: false })).toBeInTheDocument();
  expect(signUp).toHaveBeenCalledWith({
    email: newEmail,
    password: strongPassword,
    options: { emailRedirectTo: window.location.origin },
  });
});

it('treats an already registered email the same as a new one', async () => {
  // Given a signed-out visitor on sign up
  await renderSignedOut();

  // When they submit an email that already has an account
  submit({ email: existing.credentials.email, password: strongPassword });

  // Then they are asked to check that email, with nothing said about the account
  expect(
    await screen.findByRole('heading', { name: 'Check your email' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('shows the server message for a weak password', async () => {
  // Given a signed-out visitor on sign up
  await renderSignedOut();

  // When they submit a password shorter than the server allows
  submit({ email: newEmail, password: 'short12' });

  // Then the server's reason is shown
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Password should be at least 8 characters.',
  );
});

it('disables the button until the attempt finishes', async () => {
  // Given a signed-out visitor on sign up
  await renderSignedOut();

  // When they submit
  submit({ email: newEmail, password: 'short12' });

  // Then the button is disabled until the error shows
  expect(signUpButton()).toBeDisabled();
  await screen.findByRole('alert');
  expect(signUpButton()).toBeEnabled();
});

it('gives a generic error without the browser submitting the form', async () => {
  // Given a signed-out visitor on sign up
  await renderSignedOut();

  // When the empty form is submitted
  const submitted = fireEvent.submit(signUpButton().closest('form')!);

  // Then the browser's own submission is cancelled, and they are asked to retry
  expect(submitted).toBe(false);
  expect(await screen.findByRole('alert')).toHaveTextContent(
    "Couldn't sign up, try again",
  );
});

it('links to sign in', async () => {
  // Given a signed-out visitor on sign up
  const memoryRouter = await renderSignedOut();

  // When they follow the sign in link
  fireEvent.click(screen.getByRole('link', { name: 'Sign in' }));

  // Then they are at sign in
  expect(pathOf(memoryRouter)).toBe('/sign-in');
});
