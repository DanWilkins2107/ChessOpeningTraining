import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('matches snapshot', () => {
    const { container } = render(<Spinner label="Loading things" />);
    expect(container).toMatchSnapshot();
  });
});
