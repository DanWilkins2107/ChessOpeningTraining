import { describe, expect, it } from 'vitest';
import { isPlaced } from './placementGate';

const EXCEPTIONS = ['singleton.ts'];

describe('isPlaced', () => {
  it('accepts the given root exceptions and nothing else at the root', () => {
    expect(isPlaced('singleton.ts', EXCEPTIONS)).toBe(true);
    expect(isPlaced('stray.ts', EXCEPTIONS)).toBe(false);
    expect(isPlaced('singleton.ts', [])).toBe(false);
  });

  it('accepts companions of a root exception', () => {
    expect(isPlaced('singleton.test.ts', EXCEPTIONS)).toBe(true);
    expect(isPlaced('stray.test.ts', EXCEPTIONS)).toBe(false);
  });

  it('accepts a page folder whose files are named page.*', () => {
    expect(isPlaced('pages/Alpha/page.tsx', EXCEPTIONS)).toBe(true);
    expect(isPlaced('pages/Alpha/page.test.tsx', EXCEPTIONS)).toBe(true);
    expect(
      isPlaced(
        'pages/Alpha/__snapshots__/page.snapshot.test.tsx.snap',
        EXCEPTIONS,
      ),
    ).toBe(true);
    expect(isPlaced('pages/Alpha/stray.tsx', EXCEPTIONS)).toBe(false);
  });

  it('accepts elements named after their folder, at any depth', () => {
    expect(isPlaced('elements/Widget.tsx', EXCEPTIONS)).toBe(true);
    expect(isPlaced('elements/useWidget.test.ts', EXCEPTIONS)).toBe(true);
    expect(isPlaced('pages/Alpha/elements/Widget.tsx', EXCEPTIONS)).toBe(true);
    expect(isPlaced('pages/Alpha/elements/Widget/Widget.tsx', EXCEPTIONS)).toBe(
      true,
    );
    expect(
      isPlaced(
        'pages/Alpha/elements/Widget/elements/Knob/Knob.tsx',
        EXCEPTIONS,
      ),
    ).toBe(true);
    expect(isPlaced('pages/Alpha/elements/Widget/Knob.tsx', EXCEPTIONS)).toBe(
      false,
    );
  });

  it('rejects folders that are neither pages nor elements', () => {
    expect(isPlaced('components/Widget.tsx', EXCEPTIONS)).toBe(false);
    expect(isPlaced('pages/Alpha/helpers/format.ts', EXCEPTIONS)).toBe(false);
  });
});
