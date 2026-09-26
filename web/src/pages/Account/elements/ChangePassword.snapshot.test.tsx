import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChangePassword } from './ChangePassword';

describe('ChangePassword', () => {
  it('matches snapshot', () => {
    const { container } = render(<ChangePassword />);
    expect(container).toMatchSnapshot();
  });
});
