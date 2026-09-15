import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SuccessMessage } from './SuccessMessage';

describe('SuccessMessage', () => {
  it('matches snapshot', () => {
    const { container } = render(<SuccessMessage>Sent again</SuccessMessage>);
    expect(container).toMatchSnapshot();
  });
});
