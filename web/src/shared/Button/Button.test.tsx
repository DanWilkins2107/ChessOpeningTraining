import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { Button } from './Button';

it('styles a plain button by default', () => {
  // Given a button with no danger flag
  render(<Button disabled={false}>Save</Button>);

  // When it renders

  // Then it has only the base style
  expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('button', {
    exact: true,
  });
});

it('styles a danger button in red', () => {
  // Given a danger button
  render(
    <Button disabled={false} danger>
      Delete
    </Button>,
  );

  // When it renders

  // Then it has the base and danger styles
  expect(screen.getByRole('button', { name: 'Delete' })).toHaveClass(
    'button button-danger',
    { exact: true },
  );
});
