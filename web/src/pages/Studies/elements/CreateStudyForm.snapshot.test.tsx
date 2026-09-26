import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withQueryClient } from '../../../tests-shared/withQueryClient';
import { CreateStudyForm } from './CreateStudyForm';

describe('CreateStudyForm', () => {
  it('matches snapshot', () => {
    const { container } = render(withQueryClient(<CreateStudyForm />));
    expect(container).toMatchSnapshot();
  });
});
