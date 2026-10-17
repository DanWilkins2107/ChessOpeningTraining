import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Repertoire } from './page';
import { withQueryClient } from '../../tests-shared/withQueryClient';

describe('Repertoire', () => {
  it('matches snapshot', () => {
    const { container } = render(withQueryClient(<Repertoire />));
    expect(container).toMatchSnapshot();
  });
});
