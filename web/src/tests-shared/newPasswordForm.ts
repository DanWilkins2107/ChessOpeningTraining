import { fireEvent, screen } from '@testing-library/react';

// Every wait here is on the test stack, and saving makes it hash the password,
// which outlasts Testing Library's default one-second wait.
export const SERVER = { timeout: 3000 };

export const saveButton = () =>
  screen.findByRole('button', { name: 'Save password' }, SERVER);

async function fillIn(label: string, value: string) {
  fireEvent.change(await screen.findByLabelText(label, {}, SERVER), {
    target: { value },
  });
}

export async function enterNewPassword(password: string) {
  await fillIn('New password', password);
  await fillIn('Confirm new password', password);
}

export async function savePassword(password: string) {
  await enterNewPassword(password);
  fireEvent.click(await saveButton());
}
