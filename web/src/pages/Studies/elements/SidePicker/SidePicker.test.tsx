import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { SidePicker } from './SidePicker';

it('starts on white', () => {
  // Given the side picker

  // When it renders
  render(<SidePicker />);

  // Then white is the chosen side, not black
  expect(screen.getByLabelText('white')).toBeChecked();
  expect(screen.getByLabelText('black')).not.toBeChecked();
});
