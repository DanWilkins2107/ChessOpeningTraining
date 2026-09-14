import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <TextInput label="Email" name="email" type="email" />,
    );
    expect(container).toMatchSnapshot();
  });
});
