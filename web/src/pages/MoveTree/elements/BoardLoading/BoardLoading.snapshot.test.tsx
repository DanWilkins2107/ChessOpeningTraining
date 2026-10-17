import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BoardLoading } from './BoardLoading';

describe('BoardLoading', () => {
  it('matches snapshot', () => {
    const { container } = render(<BoardLoading />);
    expect(container).toMatchSnapshot();
  });
});
