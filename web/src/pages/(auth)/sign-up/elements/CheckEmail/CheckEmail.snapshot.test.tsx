import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CheckEmail } from './CheckEmail';

describe('CheckEmail', () => {
  it('matches snapshot', () => {
    const { container } = render(<CheckEmail email="player@example.test" />);
    expect(container).toMatchSnapshot();
  });
});
