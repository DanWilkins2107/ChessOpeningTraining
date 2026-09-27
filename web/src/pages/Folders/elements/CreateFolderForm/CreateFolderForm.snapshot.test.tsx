import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CreateFolderForm } from './CreateFolderForm';

describe('CreateFolderForm', () => {
  it('matches snapshot', () => {
    const { container } = render(<CreateFolderForm onCreated={() => {}} />);
    expect(container).toMatchSnapshot();
  });
});
