import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FolderLoadError } from './FolderLoadError';

describe('FolderLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<FolderLoadError />);
    expect(container).toMatchSnapshot();
  });
});
