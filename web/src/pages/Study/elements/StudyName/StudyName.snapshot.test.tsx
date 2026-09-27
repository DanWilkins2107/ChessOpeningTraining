import { act, render } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it } from 'vitest';
import { StudyName } from './StudyName';

describe('StudyName', () => {
  it('matches snapshot', async () => {
    const { container } = await act(() =>
      render(
        <Suspense>
          <StudyName study={Promise.resolve({ name: 'London' })} />
        </Suspense>,
      ),
    );
    expect(container).toMatchSnapshot();
  });
});
