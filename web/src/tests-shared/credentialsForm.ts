import { fireEvent, screen } from '@testing-library/react';

type Credentials = { email: string; password: string };

export function fillCredentials(credentials: Credentials) {
  fireEvent.change(screen.getByLabelText('Email'), {
    target: { value: credentials.email },
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: credentials.password },
  });
}

export function submitCredentials(
  submitButton: HTMLElement,
  credentials: Credentials,
) {
  fillCredentials(credentials);
  fireEvent.click(submitButton);
}
