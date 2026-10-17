import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Repertoire } from './page';

describe('Repertoire', () => {
  it('matches snapshot', () => {
    const { container } = render(<Repertoire />);
    expect(container).toMatchSnapshot();
  });
});
