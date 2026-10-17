import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoveTreeLoadError } from './MoveTreeLoadError';

describe('MoveTreeLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<MoveTreeLoadError />);
    expect(container).toMatchSnapshot();
  });
});
