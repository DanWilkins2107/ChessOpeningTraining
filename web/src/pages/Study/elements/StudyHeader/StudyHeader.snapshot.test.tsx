import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudyHeader } from './StudyHeader';

describe('StudyHeader', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <StudyHeader
        response={{
          success: true,
          data: { name: 'London' },
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
