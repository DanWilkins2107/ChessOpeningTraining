import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { PasswordChecklist } from './PasswordChecklist';

afterEach(cleanup);

const rules = () =>
  within(screen.getByRole('list', { name: 'Password needs' }))
    .getAllByRole('listitem')
    .map((item) => item.textContent);

it('lists every rule as not yet done for an empty password', () => {
  // Given no password yet

  // When the rules render
  render(<PasswordChecklist password="" />);

  // Then every rule is listed, none done
  expect(rules()).toEqual([
    'At least 8 characters',
    'A lowercase letter',
    'An uppercase letter',
    'A number',
    'A symbol',
  ]);
});

it('marks the rules a password meets as done', () => {
  // Given a password with only lowercase letters and a number, 8 long
  const password = 'abcdefg1';

  // When the rules render
  render(<PasswordChecklist password={password} />);

  // Then just those rules are done
  expect(rules()).toEqual([
    'At least 8 characters (done)',
    'A lowercase letter (done)',
    'An uppercase letter',
    'A number (done)',
    'A symbol',
  ]);
});
