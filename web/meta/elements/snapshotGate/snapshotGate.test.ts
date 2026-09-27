import { describe, expect, it } from 'vitest';
import { needsSnapshot, snapshotPathFor } from './snapshotGate';

const NON_COMPONENTS = ['entry.tsx'];

describe('needsSnapshot', () => {
  it('requires a snapshot of a .tsx wherever it sits', () => {
    expect(needsSnapshot('pages/Alpha/page.tsx', NON_COMPONENTS)).toBe(true);
    expect(
      needsSnapshot('pages/Alpha/elements/Widget/Widget.tsx', NON_COMPONENTS),
    ).toBe(true);
  });

  it('exempts test files', () => {
    expect(needsSnapshot('pages/Alpha/page.test.tsx', NON_COMPONENTS)).toBe(
      false,
    );
    expect(
      needsSnapshot('pages/Alpha/page.snapshot.test.tsx', NON_COMPONENTS),
    ).toBe(false);
  });

  it('exempts modules that are not .tsx', () => {
    expect(needsSnapshot('elements/useWidget.ts', NON_COMPONENTS)).toBe(false);
    expect(needsSnapshot('elements/Widget.css', NON_COMPONENTS)).toBe(false);
  });

  it('exempts a .tsx only while it is on the given list', () => {
    expect(needsSnapshot('entry.tsx', NON_COMPONENTS)).toBe(false);
    expect(needsSnapshot('entry.tsx', [])).toBe(true);
  });
});

describe('snapshotPathFor', () => {
  it('names the committed snapshot beside the component', () => {
    expect(snapshotPathFor('pages/Alpha/page.tsx')).toBe(
      'pages/Alpha/__snapshots__/page.snapshot.test.tsx.snap',
    );
    expect(snapshotPathFor('elements/Widget.tsx')).toBe(
      'elements/__snapshots__/Widget.snapshot.test.tsx.snap',
    );
  });
});
