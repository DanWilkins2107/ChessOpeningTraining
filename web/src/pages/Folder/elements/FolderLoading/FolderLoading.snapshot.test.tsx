import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FolderLoading } from './FolderLoading';

describe('FolderLoading', () => {
  it('matches snapshot', () => {
    const { container } = render(<FolderLoading />);
    expect(container).toMatchSnapshot();
  });
});
