import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Account } from './page';

describe('Account', () => {
  it('matches snapshot', () => {
    const { container } = render(<Account />);
    expect(container).toMatchSnapshot();
  });
});
