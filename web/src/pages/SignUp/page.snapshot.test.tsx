import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { SignUp } from './page';

describe('SignUp', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <SignUp />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
