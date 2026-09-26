import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PasswordChecklist } from './PasswordChecklist';

describe('PasswordChecklist', () => {
  it('matches snapshot', () => {
    const { container } = render(<PasswordChecklist password="abcdefgh" />);
    expect(container).toMatchSnapshot();
  });
});
