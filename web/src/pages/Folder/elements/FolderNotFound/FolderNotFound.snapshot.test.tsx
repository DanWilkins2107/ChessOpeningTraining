import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FolderNotFound } from './FolderNotFound';

describe('FolderNotFound', () => {
  it('matches snapshot', () => {
    const { container } = render(<FolderNotFound />);
    expect(container).toMatchSnapshot();
  });
});
