import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SIGNED_OUT_DONE } from '../../../elements/signOut.constants';
import { SignOutNotice } from './SignOutNotice';

describe('SignOutNotice', () => {
  it('matches snapshot', () => {
    const { container } = render(<SignOutNotice outcome={SIGNED_OUT_DONE} />);
    expect(container).toMatchSnapshot();
  });
});
