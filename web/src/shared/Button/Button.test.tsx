import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
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

it('submits its form by default', () => {
  // Given a button with no click handler
  render(<Button disabled={false}>Save</Button>);

  // When it renders

  // Then it submits
  expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute(
    'type',
    'submit',
  );
});

it('runs its click handler without submitting', () => {
  // Given a button with a click handler
  const onClick = vi.fn();
  render(
    <Button disabled={false} onClick={onClick}>
      Retry
    </Button>,
  );

  // When it is clicked
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

  // Then it runs the handler and is not a submit button
  expect(onClick).toHaveBeenCalledOnce();
  expect(screen.getByRole('button', { name: 'Retry' })).toHaveAttribute(
    'type',
    'button',
  );
});

it('leaves focus alone by default', () => {
  // Given a button without autoFocus
  render(<Button disabled={false}>Save</Button>);

  // When it renders

  // Then it doesn't take focus
  expect(screen.getByRole('button', { name: 'Save' })).not.toHaveFocus();
});

it('takes focus with autoFocus', () => {
  // Given a button with autoFocus
  render(
    <Button disabled={false} autoFocus>
      Save
    </Button>,
  );

  // When it renders

  // Then it has focus
  expect(screen.getByRole('button', { name: 'Save' })).toHaveFocus();
});
