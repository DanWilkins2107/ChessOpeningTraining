import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CreateStudyForm } from './CreateStudyForm';

describe('CreateStudyForm', () => {
  it('matches snapshot', () => {
    const { container } = render(<CreateStudyForm onCreated={() => {}} />);
    expect(container).toMatchSnapshot();
  });
});
