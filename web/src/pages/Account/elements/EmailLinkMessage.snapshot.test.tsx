import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { EmailLinkMessage } from './EmailLinkMessage';

describe('EmailLinkMessage', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <MemoryRouter
        initialEntries={['/account#message=Confirmation+link+accepted']}
      >
        <EmailLinkMessage />
      </MemoryRouter>,
    );
    expect(container).toMatchSnapshot();
  });
});
