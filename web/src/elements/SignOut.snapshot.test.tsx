import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SignOut } from './SignOut';

describe('SignOut', () => {
  it('matches snapshot', () => {
    const { container } = render(<SignOut showButton />);
    expect(container).toMatchSnapshot();
  });
});
