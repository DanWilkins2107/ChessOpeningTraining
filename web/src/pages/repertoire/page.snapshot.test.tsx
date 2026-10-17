import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withQueryClient } from '../../tests-shared/withQueryClient';
import { Repertoire } from './page';

describe('Repertoire', () => {
  it('matches snapshot', () => {
    const { container } = render(withQueryClient(<Repertoire />));
    expect(container).toMatchSnapshot();
  });
});
