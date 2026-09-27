import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudyDetails } from './StudyDetails';

describe('StudyDetails', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <StudyDetails studyId="7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d" />,
    );
    expect(container).toMatchSnapshot();
  });
});
