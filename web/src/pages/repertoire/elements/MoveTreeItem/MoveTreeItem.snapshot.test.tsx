import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MoveTreeItem } from './MoveTreeItem';

describe('MoveTreeItem', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <ul>
        <MoveTreeItem
          moveTree={{
            id: 'e5f6',
            name: 'Sicilian',
            side: 'black',
            folder_id: null,
          }}
        />
      </ul>,
    );
    expect(container).toMatchSnapshot();
  });
});
