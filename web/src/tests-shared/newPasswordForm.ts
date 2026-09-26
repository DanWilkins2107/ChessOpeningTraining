import { fireEvent, screen } from '@testing-library/react';

// Every wait here is on the test stack, and saving makes it hash the password,
// which outlasts Testing Library's default one-second wait.
export const SERVER = { timeout: 3000 };

export const saveButton = () =>
  screen.findByRole('button', { name: 'Save password' }, SERVER);

export async function enterNewPassword(password: string) {
  fireEvent.change(await screen.findByLabelText('New password', {}, SERVER), {
    target: { value: password },
  });
}

export async function savePassword(password: string) {
  await enterNewPassword(password);
  fireEvent.click(await saveButton());
}
