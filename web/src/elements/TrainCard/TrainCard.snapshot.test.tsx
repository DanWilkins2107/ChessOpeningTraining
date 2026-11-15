import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { TrainCard } from './TrainCard';

describe('TrainCard', () => {
  it('matches snapshot', () => {
    const { container } = render(
      <TrainCard daysSinceLastTrained={2} movesTrainedToday={7} />,
      { wrapper: MemoryRouter },
    );
    expect(container).toMatchSnapshot();
  });
});
