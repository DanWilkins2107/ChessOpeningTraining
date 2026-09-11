import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RootLayout } from './RootLayout';

describe('RootLayout', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter>
        <RootLayout />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
