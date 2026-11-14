import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PawnTile } from './PawnTile';

describe('PawnTile', () => {
  it('matches snapshot', () => {
    const { container } = render(<PawnTile side="black" />);
    expect(container).toMatchSnapshot();
  });
});
