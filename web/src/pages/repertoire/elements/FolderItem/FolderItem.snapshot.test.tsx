import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FolderItem } from './FolderItem';

describe('FolderItem', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <ul>
        <FolderItem
          folder={{ id: 'a4f1', name: 'London' }}
          moveTrees={[
            { id: 'b1a2', name: 'Jobava', side: 'white', folder_id: 'a4f1' },
          ]}
        />
      </ul>,
    );
    expect(container).toMatchSnapshot();
  });
});
