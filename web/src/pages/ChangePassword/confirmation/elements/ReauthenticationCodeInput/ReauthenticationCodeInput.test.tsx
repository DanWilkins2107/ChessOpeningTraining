import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { ReauthenticationCodeInput } from './ReauthenticationCodeInput';
import { CODE_SENT_MESSAGE } from './ReauthenticationCodeInput.constants';

it('says a code was sent and asks for it', () => {
  // Given the code input
  render(<ReauthenticationCodeInput />);

  // When it renders

  // Then it says a code was emailed, with a one-time code field
  expect(screen.getByText(CODE_SENT_MESSAGE)).toBeInTheDocument();
  expect(screen.getByLabelText('Code')).toHaveAttribute(
    'autocomplete',
    'one-time-code',
  );
});
