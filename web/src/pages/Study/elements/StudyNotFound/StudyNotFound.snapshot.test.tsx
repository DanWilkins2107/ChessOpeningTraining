import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StudyNotFound } from './StudyNotFound';

describe('StudyNotFound', () => {
  it('matches snapshot', () => {
    const { container } = render(<StudyNotFound />);
    expect(container).toMatchSnapshot();
  });
});
