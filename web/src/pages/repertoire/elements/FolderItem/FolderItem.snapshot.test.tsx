import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FolderItem } from './FolderItem';

describe('FolderItem', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <ul>
        <FolderItem folder={{ id: 'a4f1', name: 'London', parent_id: null }} />
      </ul>,
    );
    expect(container).toMatchSnapshot();
  });
});
