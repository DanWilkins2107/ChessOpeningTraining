import { expect, it } from 'vitest';
import { passwordRules } from './passwordRules';

const unmetBy = (password: string) =>
  passwordRules.filter(({ met }) => !met(password)).map(({ label }) => label);

it('passes a password meeting every rule', () => {
  // Given a password with every kind of character, 8 long
  const password = 'Abcdef1!';

  // When it is checked
  const unmet = unmetBy(password);

  // Then no rule is unmet
  expect(unmet).toEqual([]);
});

it.each([
  ['At least 8 characters', 'Abcde1!'],
  ['A lowercase letter', 'ABCDEF1!'],
  ['An uppercase letter', 'abcdef1!'],
  ['A number', 'Abcdefg!'],
  ['A symbol', 'Abcdefg1'],
])('flags only "%s" when it is the one missing', (rule, password) => {
  // Given a password missing just this rule

  // When it is checked
  const unmet = unmetBy(password);

  // Then only that rule is unmet
  expect(unmet).toEqual([rule]);
});

it.each([...`!@#$%^&*()_+-=[]{};'\\:"|<>?,./\`~`])(
  'counts %s as a symbol',
  (symbol) => {
    // Given a password whose only symbol is this one
    const password = `Abcdefg1${symbol}`;

    // When it is checked
    const unmet = unmetBy(password);

    // Then it meets every rule
    expect(unmet).toEqual([]);
  },
);

it.each([' ', '£', 'é'])(
  'does not count %j as a symbol, as the server does not',
  (char) => {
    // Given a password whose only non-alphanumeric character is this one
    const password = `Abcdefg1${char}`;

    // When it is checked
    const unmet = unmetBy(password);

    // Then it still needs a symbol
    expect(unmet).toEqual(['A symbol']);
  },
);
