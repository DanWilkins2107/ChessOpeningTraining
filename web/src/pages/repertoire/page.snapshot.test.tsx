import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { Repertoire } from './page';

describe('Repertoire', () => {
  it('matches snapshot', () => {
    const { container } = render(<Repertoire />, { wrapper: MemoryRouter });
    expect(container).toMatchSnapshot();
  });
});
