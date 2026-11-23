import { describe, expect, it } from 'vitest';
import { renderMoveTreeDetails } from '../../tests-shared/moveTreeDetails';

describe('MoveTreeDetails', () => {
  it('matches snapshot', () => {
    const { container } = renderMoveTreeDetails(null);
    expect(container).toMatchSnapshot();
  });
});
