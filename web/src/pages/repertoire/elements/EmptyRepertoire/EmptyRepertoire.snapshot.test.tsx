import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyRepertoire } from './EmptyRepertoire';

describe('EmptyRepertoire', () => {
  it('matches snapshot', () => {
    const { container } = render(<EmptyRepertoire onCreateFolder={() => {}} />);
    expect(container).toMatchSnapshot();
  });
});
