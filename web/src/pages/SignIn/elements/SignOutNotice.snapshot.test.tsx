import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SignOutNotice } from './SignOutNotice';

describe('SignOutNotice', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <SignOutNotice notice="Sign out successful" />,
    );
    expect(container).toMatchSnapshot();
  });
});
