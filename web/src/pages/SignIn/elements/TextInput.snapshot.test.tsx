import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <TextInput
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
      />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot as a password', () => {
    const { container } = render(
      <TextInput
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
