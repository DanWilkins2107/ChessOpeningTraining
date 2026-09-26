import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudyList } from './StudyList';

describe('StudyList', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <StudyList
        response={{
          success: true,
          data: [{ id: 'a4f1', name: 'London', side: 'white' }],
          error: null,
          count: null,
          status: 200,
          statusText: 'OK',
        }}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
