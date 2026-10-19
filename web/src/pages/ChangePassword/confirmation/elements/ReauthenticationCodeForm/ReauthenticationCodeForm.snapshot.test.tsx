import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ReauthenticationCodeForm } from './ReauthenticationCodeForm';

describe('ReauthenticationCodeForm', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <ReauthenticationCodeForm pending={false} onSubmit={() => {}} />,
    );
    expect(container).toMatchSnapshot();
  });

  it('matches snapshot with an error while pending', () => {
    const { container } = render(
      <ReauthenticationCodeForm
        pending
        error="That code is wrong or has expired"
        onSubmit={() => {}}
      />,
    );
    expect(container).toMatchSnapshot();
  });
});
