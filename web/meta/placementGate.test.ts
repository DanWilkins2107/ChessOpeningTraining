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
    expect(isPlaced('pages/Alpha/page.integration.test.tsx', EXCEPTIONS)).toBe(
      true,
    );
    expect(
      isPlaced(
        'pages/Alpha/__snapshots__/page.snapshot.test.tsx.snap',
        EXCEPTIONS,
      ),
    ).toBe(true);
    expect(isPlaced('pages/Alpha/stray.tsx', EXCEPTIONS)).toBe(false);
  });

  it('accepts a module folder of files named after it in elements or shared', () => {
    expect(isPlaced('elements/Widget/Widget.tsx', EXCEPTIONS)).toBe(true);
    expect(isPlaced('shared/Widget/Widget.tsx', EXCEPTIONS)).toBe(true);
    expect(isPlaced('elements/useWidget/useWidget.test.ts', EXCEPTIONS)).toBe(
      true,
    );
    expect(
      isPlaced('elements/useWidget/useWidget.integration.test.ts', EXCEPTIONS),
    ).toBe(true);
    expect(
      isPlaced('elements/useWidget/useWidget.constants.ts', EXCEPTIONS),
    ).toBe(true);
    expect(
      isPlaced(
        'elements/Widget/__snapshots__/Widget.snapshot.test.tsx.snap',
        EXCEPTIONS,
      ),
    ).toBe(true);
    expect(isPlaced('pages/Alpha/elements/Widget/Widget.tsx', EXCEPTIONS)).toBe(
      true,
    );
    expect(isPlaced('pages/Alpha/shared/Widget/Widget.tsx', EXCEPTIONS)).toBe(
      true,
    );
  });

  it('rejects modules outside a module folder of their own name', () => {
    expect(isPlaced('elements/Widget.tsx', EXCEPTIONS)).toBe(false);
    expect(isPlaced('shared/Widget.tsx', EXCEPTIONS)).toBe(false);
    expect(isPlaced('elements/Widget/Knob.tsx', EXCEPTIONS)).toBe(false);
    expect(isPlaced('elements/not.a.name/not.a.name.ts', EXCEPTIONS)).toBe(
      false,
    );
    expect(
      isPlaced(
        'elements/Widget/__snapshots__/Knob.snapshot.test.tsx.snap',
        EXCEPTIONS,
      ),
    ).toBe(false);
  });

  it('does not nest owners inside a module folder', () => {
    expect(isPlaced('elements/Widget/elements/Knob/Knob.tsx', EXCEPTIONS)).toBe(
      false,
    );
    expect(isPlaced('elements/Widget/shared/Knob/Knob.tsx', EXCEPTIONS)).toBe(
      false,
    );
    expect(isPlaced('elements/Widget/tests-shared/knob.ts', EXCEPTIONS)).toBe(
      false,
    );
    expect(isPlaced('pages/Alpha/pages/Beta/page.tsx', EXCEPTIONS)).toBe(false);
  });

  it('accepts svg assets and their licence file in module folders', () => {
    expect(isPlaced('elements/pieces/wK.svg', EXCEPTIONS)).toBe(true);
    expect(isPlaced('elements/pieces/LICENSE.txt', EXCEPTIONS)).toBe(true);
    expect(isPlaced('pages/Alpha/shared/Board/Board.svg', EXCEPTIONS)).toBe(
      true,
    );
    expect(isPlaced('elements/wK.svg', EXCEPTIONS)).toBe(false);
    expect(isPlaced('elements/LICENSE.txt', EXCEPTIONS)).toBe(false);
    expect(isPlaced('pages/Alpha/wK.svg', EXCEPTIONS)).toBe(false);
    expect(isPlaced('pages/Alpha/LICENSE.txt', EXCEPTIONS)).toBe(false);
    expect(isPlaced('elements/pieces/NOTES.txt', EXCEPTIONS)).toBe(false);
  });

  it('accepts flat .ts test helpers at the root and in pages', () => {
    expect(isPlaced('tests-shared/testUser.ts', EXCEPTIONS)).toBe(true);
    expect(isPlaced('pages/Alpha/tests-shared/renderAt.ts', EXCEPTIONS)).toBe(
      true,
    );
    expect(isPlaced('tests-shared/renderAt.tsx', EXCEPTIONS)).toBe(false);
    expect(isPlaced('tests-shared/testUser.test.ts', EXCEPTIONS)).toBe(false);
    expect(isPlaced('tests-shared/helpers/testUser.ts', EXCEPTIONS)).toBe(
      false,
    );
  });

  it('rejects folders that are neither pages nor module folders', () => {
    expect(isPlaced('components/Widget/Widget.tsx', EXCEPTIONS)).toBe(false);
    expect(isPlaced('pages/Alpha/helpers/format.ts', EXCEPTIONS)).toBe(false);
    expect(isPlaced('pages/not.a.name/page.tsx', EXCEPTIONS)).toBe(false);
  });
});
