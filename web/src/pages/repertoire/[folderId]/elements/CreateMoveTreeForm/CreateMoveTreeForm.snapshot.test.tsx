import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CreateMoveTreeForm } from './CreateMoveTreeForm';

describe('CreateMoveTreeForm', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <CreateMoveTreeForm
        folderId="7c3e1d2a-5b4f-4e6a-9c8d-1f2e3a4b5c6d"
        onCreated={() => {}}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
