import { act, fireEvent, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { authSettled } from '../../tests-shared/authSettled';
import { pathOf, renderAt } from '../../tests-shared/renderAt';
import { registerTestUser } from '../../tests-shared/testUser';

const confirmed = registerTestUser();
const unconfirmed = registerTestUser({ emailConfirmed: false });

const signInButton = () => screen.getByRole('button', { name: 'Sign in' });

function submit(credentials: { email: string; password: string }) {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: credentials.email },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: credentials.password },
  });
  fireEvent.click(signInButton());
}

it('shows the form while the user is still loading', async () => {
  // Given a signed-in user not yet loaded
  await confirmed.signIn();

  // When sign in renders
  const memoryRouter = renderAt('/sign-in?next=%2Fstudies');

  // Then it shows the form without navigating
  expect(signInButton()).toBeInTheDocument();
  expect(pathOf(memoryRouter)).toBe('/sign-in?next=%2Fstudies');
});

it('sends a signed-in user to their return path', async () => {
  // Given a signed-in user
  await confirmed.signIn();

  // When they open sign in with a return path and the user loads
  const memoryRouter = renderAt('/sign-in?next=%2Fstudies%3Fline%3Dab12');
  await authSettled();

  // Then they are at the return path
  expect(pathOf(memoryRouter)).toBe('/studies?line=ab12');
});

it('leaves sign in out of history when sending a signed-in user on', async () => {
  // Given a signed-in user sent on from sign in
  await confirmed.signIn();
  const memoryRouter = renderAt('/elsewhere', '/sign-in?next=%2Fstudies');
  await authSettled();

  // When they go back
  await act(() => memoryRouter.navigate(-1));

  // Then they land where they were before it
  expect(pathOf(memoryRouter)).toBe('/elsewhere');
});

it('signs in and returns to the return path', async () => {
  // Given a signed-out visitor on sign in with a return path
  const memoryRouter = renderAt('/sign-in?next=%2F%3Fstudy%3Dab12');
  await authSettled();

  // When they submit correct credentials
  submit(confirmed.credentials);

  // Then they are signed in at the return path
  expect(
    await screen.findByRole('heading', { name: 'Chess Opening Training' }),
  ).toBeInTheDocument();
  expect(pathOf(memoryRouter)).toBe('/?study=ab12');
});

it('signs in without the browser submitting the form', async () => {
  // Given a signed-out visitor on sign in
  renderAt('/sign-in');
  await authSettled();

  // When the form is submitted
  const submitted = fireEvent.submit(signInButton().closest('form')!);

  // Then the browser's own submission is cancelled
  expect(submitted).toBe(false);
  await screen.findByRole('alert');
});

it('disables the button until the attempt finishes', async () => {
  // Given a signed-out visitor on sign in
  renderAt('/sign-in');
  await authSettled();

  // When they submit
  submit({ ...confirmed.credentials, password: crypto.randomUUID() });

  // Then the button is disabled until the error shows
  expect(signInButton()).toBeDisabled();
  await screen.findByRole('alert');
  expect(signInButton()).toBeEnabled();
});

it.each([
  [
    'a wrong password',
    () => ({ ...confirmed.credentials, password: crypto.randomUUID() }),
  ],
  [
    'an email with no account',
    () => ({
      email: `nobody-${crypto.randomUUID()}@example.test`,
      password: crypto.randomUUID(),
    }),
  ],
])('gives the same error for %s', async (_case, credentials) => {
  // Given a signed-out visitor on sign in
  renderAt('/sign-in');
  await authSettled();

  // When they submit the credentials
  submit(credentials());

  // Then the error does not say which part was wrong
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Incorrect email or password',
  );
});

it('asks for email confirmation when the password matches', async () => {
  // Given a signed-out visitor on sign in
  renderAt('/sign-in');
  await authSettled();

  // When they submit the correct credentials of an unconfirmed account
  submit(unconfirmed.credentials);

  // Then they are asked to confirm their email
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Confirm your email first',
  );
});
