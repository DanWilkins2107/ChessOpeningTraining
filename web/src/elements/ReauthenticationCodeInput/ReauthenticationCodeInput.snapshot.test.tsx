import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReauthenticationCodeInput } from './ReauthenticationCodeInput';

describe('ReauthenticationCodeInput', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <ReauthenticationCodeInput onChange={() => {}} />,
    );
    expect(container).toMatchSnapshot();
  });
});
