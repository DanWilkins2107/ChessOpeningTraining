import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { TextInput } from './TextInput';

afterEach(cleanup);

function renderPassword() {
  render(
    <TextInput
      label="Password"
      name="password"
      type="password"
      autoComplete="current-password"
    />,
  );
}

it('hides the password until shown', () => {
  // Given a password field
  renderPassword();

  // When nothing is clicked

  // Then the password is hidden, with a button to show it
  expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  expect(
    screen.getByRole('button', { name: 'Show password' }),
  ).toHaveTextContent('Show');
});

it('shows the password', () => {
  // Given a password field
  renderPassword();

  // When show password is clicked
  fireEvent.click(screen.getByRole('button', { name: 'Show password' }));

  // Then the password is visible, with a button to hide it
  expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'text');
  expect(
    screen.getByRole('button', { name: 'Hide password' }),
  ).toHaveTextContent('Hide');
});

it('hides the password again', () => {
  // Given a shown password
  renderPassword();
  fireEvent.click(screen.getByRole('button', { name: 'Show password' }));

  // When hide password is clicked
  fireEvent.click(screen.getByRole('button', { name: 'Hide password' }));

  // Then the password is hidden
  expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
});

it('offers no show button for an email', () => {
  // Given an email field
  render(
    <TextInput label="Email" name="email" type="email" autoComplete="email" />,
  );

  // When nothing is clicked

  // Then there is no button to show it
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('reports what is typed', () => {
  // Given a field reporting its changes
  const reported: string[] = [];
  render(
    <TextInput
      label="Password"
      name="password"
      type="password"
      autoComplete="new-password"
      onChange={(value) => reported.push(value)}
    />,
  );

  // When something is typed
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: 'typed' },
  });

  // Then the new value is reported
  expect(reported).toEqual(['typed']);
});
