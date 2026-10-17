import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { withQueryClient } from '../../../../tests-shared/withQueryClient';
import { ProfileSettings } from './ProfileSettings';

describe('ProfileSettings', () => {
  it('matches snapshot', () => {
    const { container } = render(withQueryClient(<ProfileSettings />));
    expect(container).toMatchSnapshot();
  });
});
