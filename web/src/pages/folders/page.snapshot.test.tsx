import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Folders } from './page';

describe('Folders', () => {
  it('matches snapshot', () => {
    const { container } = render(<Folders />);
    expect(container).toMatchSnapshot();
  });
});
