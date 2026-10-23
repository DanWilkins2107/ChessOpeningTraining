import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ReauthenticationCodeForm } from './ReauthenticationCodeForm';

it('asks for the code', () => {
  // Given a form that is not pending
  render(<ReauthenticationCodeForm pending={false} onSubmit={() => {}} />);

  // When it renders

  // Then it has a code field and an enabled confirm button
  expect(screen.getByLabelText('Code')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirm' })).toBeEnabled();
});

it('shows no error without one', () => {
  // Given a form with no error
  render(<ReauthenticationCodeForm pending={false} onSubmit={() => {}} />);

  // When it renders

  // Then no error is shown
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it('shows the error', () => {
  // Given a form with an error
  render(
    <ReauthenticationCodeForm
      pending={false}
      error="That code is wrong or has expired"
      onSubmit={() => {}}
    />,
  );

  // When it renders

  // Then the error is shown
  expect(screen.getByRole('alert')).toHaveTextContent(
    'That code is wrong or has expired',
  );
});
