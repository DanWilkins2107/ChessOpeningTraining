import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudyLoading } from './StudyLoading';

describe('StudyLoading', () => {
  it('matches snapshot', () => {
    const { container } = render(<StudyLoading />);
    expect(container).toMatchSnapshot();
  });
});
