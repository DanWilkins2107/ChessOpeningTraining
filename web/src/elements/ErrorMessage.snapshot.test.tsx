import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <ErrorMessage>Incorrect email or password</ErrorMessage>,
    );
    expect(container).toMatchSnapshot();
  });
});
