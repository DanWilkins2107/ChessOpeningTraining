import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ConfirmPasswordInput } from './ConfirmPasswordInput';

describe('ConfirmPasswordInput', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <ConfirmPasswordInput
        password="Aa1!first"
        confirmation="Aa1!second"
        onChange={() => {}}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
