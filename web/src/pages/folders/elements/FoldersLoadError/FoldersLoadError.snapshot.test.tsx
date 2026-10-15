import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FoldersLoadError } from './FoldersLoadError';

describe('FoldersLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<FoldersLoadError retry={() => {}} />);
    expect(container).toMatchSnapshot();
  });
});
