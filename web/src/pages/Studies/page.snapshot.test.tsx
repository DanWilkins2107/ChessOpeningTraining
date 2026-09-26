import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withQueryClient } from '../../tests-shared/withQueryClient';
import { Studies } from './page';

describe('Studies', () => {
  it('matches snapshot', () => {
    const { container } = render(withQueryClient(<Studies />));
    expect(container).toMatchSnapshot();
  });
});
