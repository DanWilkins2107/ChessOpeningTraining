import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoveTreeLayout } from './MoveTreeLayout';

describe('MoveTreeLayout', () => {
  it.each([true, false])('matches snapshot when busy is %s', (busy) => {
    const { container } = render(<MoveTreeLayout busy={busy} />);
    expect(container).toMatchSnapshot();
  });
});
