import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FolderTile } from './FolderTile';

describe('FolderTile', () => {
  it('matches snapshot', () => {
    const { container } = render(<FolderTile />);
    expect(container).toMatchSnapshot();
  });
});
