import { describe, expect, it } from 'vitest';
import { needsSnapshot, snapshotPathFor } from './snapshotGate';

describe('needsSnapshot', () => {
  it('takes every component', () => {
    expect(needsSnapshot('pages/Alpha/page.tsx')).toBe(true);
    expect(needsSnapshot('pages/Alpha/elements/Widget/Widget.tsx')).toBe(true);
  });

  it('skips tests, non-components and the src exceptions', () => {
    expect(needsSnapshot('pages/Alpha/page.test.tsx')).toBe(false);
    expect(needsSnapshot('pages/Alpha/page.snapshot.test.tsx')).toBe(false);
    expect(needsSnapshot('elements/useWidget.ts')).toBe(false);
    expect(needsSnapshot('main.tsx')).toBe(false);
    expect(needsSnapshot('router.tsx')).toBe(false);
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
