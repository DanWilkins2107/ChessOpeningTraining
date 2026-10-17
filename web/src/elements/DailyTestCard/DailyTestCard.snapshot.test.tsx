import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { DailyTestCard } from './DailyTestCard';

describe('DailyTestCard', () => {
  it('matches snapshot', () => {
    const { container } = render(<DailyTestCard status="done" score={80} />, {
      wrapper: MemoryRouter,
    });
    expect(container).toMatchSnapshot();
  });
});
