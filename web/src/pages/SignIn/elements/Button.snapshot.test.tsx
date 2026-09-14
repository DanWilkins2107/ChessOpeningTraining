import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('matches snapshot', () => {
    const { container } = render(<Button disabled={false}>Sign in</Button>);
    expect(container).toMatchSnapshot();
  });
});
