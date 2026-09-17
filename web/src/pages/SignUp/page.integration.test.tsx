import { act, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { authSettled } from '../../tests-shared/authSettled';
import {
  fillCredentials,
  submitCredentials,
} from '../../tests-shared/credentialsForm';
import { pathOf, renderAt, renderSettledAt } from '../../tests-shared/renderAt';
import {
  registerSignUpEmail,
  registerTestUser,
} from '../../tests-shared/testUser';
import { supabase } from '../../supabase';

const existing = registerTestUser();
const newEmail = registerSignUpEmail();
const strongPassword = `Aa1!${crypto.randomUUID()}`;

afterEach(() => {
  vi.restoreAllMocks();
});

const signUpButton = () => screen.getByRole('button', { name: 'Sign up' });

const typePassword = (password: string) =>
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: password },
  });

const unmetRules = () =>
  within(screen.getByRole('list', { name: 'Password needs' }))
    .getAllByRole('listitem')
    .map((item) => item.textContent)
    .filter((text) => !text?.endsWith('(done)'));

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
  await renderSettledAt('/sign-up');
  // mock-reason: the redirect is the assertion, and the test stack only honours
  // redirects on its allow list, which the test origin is not on, so the email
  // cannot show it. The spy still calls the real client.
  const signUp = vi.spyOn(supabase.auth, 'signUp');

  // When they submit a new email and a password meeting every rule
  submitCredentials(signUpButton(), {
    email: newEmail,
    password: strongPassword,
  });
  expect(unmetRules()).toEqual([]);

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
  await renderSettledAt('/sign-up');

  // When they submit an email that already has an account
  submitCredentials(signUpButton(), {
    email: existing.credentials.email,
    password: strongPassword,
  });

  // Then they are asked to check that email, with nothing said about the account
  expect(
    await screen.findByRole('heading', { name: 'Check your email' }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('ticks off the password rules as they type', async () => {
  // Given a signed-out visitor on sign up, with every rule still to meet
  await renderSettledAt('/sign-up');
  expect(unmetRules()).toHaveLength(5);

  // When they type a password meeting some of the rules
  typePassword('abcdefg1');

  // Then only the rules it misses are left
  expect(unmetRules()).toEqual(['An uppercase letter', 'A symbol']);
});

it.each([
  ['At least 8 characters', 'Abcde1!'],
  ['A lowercase letter', 'ABCDEF1!'],
  ['An uppercase letter', 'abcdef1!'],
  ['A number', 'Abcdefg!'],
  ['A symbol', 'Abcdefg1'],
])(
  'shows the server message for a password missing "%s", the rule left unticked',
  async (rule, password) => {
    // Given a signed-out visitor on sign up, with a password the checklist says
    // misses just this rule
    await renderSettledAt('/sign-up');
    fillCredentials({ email: newEmail, password });

    // When the form is submitted anyway, as it would be if the checklist
    // drifted from the server
    fireEvent.submit(signUpButton().closest('form')!);

    // Then the server refuses it too, and its reason is shown
    expect(unmetRules()).toEqual([rule]);
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /^Password should /,
    );
  },
);

it('keeps sign up disabled while the password misses a rule', async () => {
  // Given a signed-out visitor on sign up
  await renderSettledAt('/sign-up');

  // When they enter an email and a password missing a rule
  fillCredentials({ email: newEmail, password: 'Abcdefg1' });

  // Then they cannot sign up yet
  expect(signUpButton()).toBeDisabled();
});

it('keeps sign up disabled while the email is not valid', async () => {
  // Given a signed-out visitor on sign up
  await renderSettledAt('/sign-up');

  // When they enter a password meeting every rule but no valid email
  fillCredentials({ email: 'not-an-email', password: strongPassword });

  // Then they cannot sign up yet
  expect(signUpButton()).toBeDisabled();
});

it('enables sign up once the email and password are complete', async () => {
  // Given a signed-out visitor on sign up
  await renderSettledAt('/sign-up');

  // When they enter a valid email and a password meeting every rule
  fillCredentials({ email: newEmail, password: strongPassword });

  // Then they can sign up
  expect(signUpButton()).toBeEnabled();
});

it('disables the button until the attempt finishes', async () => {
  // Given a signed-out visitor on sign up
  await renderSettledAt('/sign-up');

  // When they submit an email the browser accepts but the server finds too long
  submitCredentials(signUpButton(), {
    email: `${'a'.repeat(250)}@example.test`,
    password: strongPassword,
  });

  // Then the button is disabled until the error shows
  expect(signUpButton()).toBeDisabled();
  await screen.findByRole('alert');
  expect(signUpButton()).toBeEnabled();
});

it('gives a generic error without the browser submitting the form', async () => {
  // Given a signed-out visitor on sign up
  await renderSettledAt('/sign-up');

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
  const memoryRouter = await renderSettledAt('/sign-up');

  // When they follow the sign in link
  fireEvent.click(screen.getByRole('link', { name: 'Sign in' }));

  // Then they are at sign in
  expect(pathOf(memoryRouter)).toBe('/sign-in');
});
