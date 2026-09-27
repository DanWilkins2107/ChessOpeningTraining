import { act, render } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import type { StudyResponse } from '../StudyResponse/StudyResponse';
import { StudyName } from './StudyName';

describe('StudyName', () => {
  it('matches snapshot', async () => {
    const response: StudyResponse = {
      success: true,
      data: { name: 'London', chapters: [] },
      error: null,
      count: null,
      status: 200,
      statusText: 'OK',
    };
    const { container } = await act(() =>
      render(
        <Suspense>
          <StudyName study={Promise.resolve(response)} />
        </Suspense>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
