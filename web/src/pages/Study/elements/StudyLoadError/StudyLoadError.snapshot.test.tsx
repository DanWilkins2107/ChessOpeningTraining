import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudyLoadError } from './StudyLoadError';

describe('StudyLoadError', () => {
  it('matches snapshot', () => {
    const { container } = render(<StudyLoadError />);
    expect(container).toMatchSnapshot();
  });
});
