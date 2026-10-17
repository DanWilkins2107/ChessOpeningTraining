import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RowLink } from './RowLink';

describe('RowLink', () => {
  it('matches snapshot', () => {
    const { container } = render(<RowLink to="/folders/a4f1">London</RowLink>, {
      wrapper: MemoryRouter,
    });
    expect(container).toMatchSnapshot();
  });
});
