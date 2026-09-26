import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudyList } from './StudyList';

describe('StudyList', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <StudyList
        studies={[{ id: 'a4f1', name: 'London', side: 'white' }]}
        failed={false}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
