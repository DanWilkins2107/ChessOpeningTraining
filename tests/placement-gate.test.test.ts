import { describe, expect, it } from 'vitest';

import { isPlaced } from './placement-gate.test';

describe('isPlaced', () => {
  it('accepts the root exceptions and nothing else at the root', () => {
    expect(isPlaced('main.tsx')).toBe(true);
    expect(isPlaced('theme.css')).toBe(true);
    expect(isPlaced('env.ts')).toBe(true);
    expect(isPlaced('stray.ts')).toBe(false);
  });

  it('accepts a page folder whose files are named page.*', () => {
    expect(isPlaced('pages/Alpha/page.tsx')).toBe(true);
    expect(isPlaced('pages/Alpha/page.test.tsx')).toBe(true);
    expect(
      isPlaced('pages/Alpha/__snapshots__/page.snapshot.test.tsx.snap'),
    ).toBe(true);
    expect(isPlaced('pages/Alpha/stray.tsx')).toBe(false);
  });

  it('accepts elements named after their folder, at any depth', () => {
    expect(isPlaced('elements/Widget.tsx')).toBe(true);
    expect(isPlaced('elements/useWidget.test.ts')).toBe(true);
    expect(isPlaced('pages/Alpha/elements/Widget.tsx')).toBe(true);
    expect(isPlaced('pages/Alpha/elements/Widget/Widget.tsx')).toBe(true);
    expect(isPlaced('pages/Alpha/elements/Widget/elements/Knob/Knob.tsx')).toBe(
      true,
    );
    expect(isPlaced('pages/Alpha/elements/Widget/Knob.tsx')).toBe(false);
  });

  it('rejects folders that are neither pages nor elements', () => {
    expect(isPlaced('components/Widget.tsx')).toBe(false);
    expect(isPlaced('pages/Alpha/helpers/format.ts')).toBe(false);
  });
});
