import { act, render } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import type { Chapter } from '../Chapter/Chapter';
import type { StudyResponse } from '../StudyResponse/StudyResponse';
import { ChapterList } from './ChapterList';

const respond = (chapters: Chapter[]): StudyResponse => ({
  success: true,
  data: { name: 'London', chapters },
  error: null,
  count: null,
  status: 200,
  statusText: 'OK',
});

describe('ChapterList', () => {
  it.each([
    [
      'chapters',
      [{ id: '7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d', name: 'Main line' }],
    ],
    ['no chapters', []],
  ])('matches snapshot with %s', async (_, chapters) => {
    const { container } = await act(() =>
      render(
        <Suspense>
          <ChapterList study={Promise.resolve(respond(chapters))} />
        </Suspense>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
