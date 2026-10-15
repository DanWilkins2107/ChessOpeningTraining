import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FoldersLoading } from './FoldersLoading';

describe('FoldersLoading', () => {
  it('matches snapshot', () => {
    const { container } = render(<FoldersLoading />);
    expect(container).toMatchSnapshot();
  });
});
