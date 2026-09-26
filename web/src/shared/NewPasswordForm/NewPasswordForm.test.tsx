import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { NewPasswordForm } from './NewPasswordForm';

const password = 'Aa1!correct-horse';

function enter(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

it('keeps save disabled while the confirmation differs', () => {
  // Given the form with a password meeting every rule
  render(<NewPasswordForm onSaved={() => {}} />);
  enter('New password', password);

  // When the confirmation does not match it
  enter('Confirm new password', `${password}x`);

  // Then they are told, and cannot save
  expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save password' })).toBeDisabled();
});

it('enables save once the confirmation matches', () => {
  // Given the form with a password meeting every rule
  render(<NewPasswordForm onSaved={() => {}} />);
  enter('New password', password);

  // When the confirmation matches it
  enter('Confirm new password', password);

  // Then there is no mismatch, and they can save
  expect(screen.queryByText("Passwords don't match")).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save password' })).toBeEnabled();
});

it('says nothing about a match before a confirmation is typed', () => {
  // Given the form
  render(<NewPasswordForm onSaved={() => {}} />);

  // When only the password is entered
  enter('New password', password);

  // Then no mismatch is shown yet
  expect(screen.queryByText("Passwords don't match")).not.toBeInTheDocument();
});
