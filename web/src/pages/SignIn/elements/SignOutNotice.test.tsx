import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SignOutNotice } from './SignOutNotice';

it('says nothing when the visitor has not just signed out', () => {
  // Given no sign-out outcome

  // When the notice renders
  render(<SignOutNotice />);

  // Then there is no status for a screen reader to announce
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
