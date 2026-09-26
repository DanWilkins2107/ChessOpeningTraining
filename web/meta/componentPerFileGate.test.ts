import { describe, expect, it } from 'vitest';
import {
  componentPerFileProblems,
  isScannedModule,
} from './componentPerFileGate';

const PAGE = 'src/pages/Home/page.tsx';

const problemsBeside = (declaration: string) =>
  componentPerFileProblems({
    [PAGE]: `export function Home() {}\n${declaration}`,
  });

describe('componentPerFileProblems', () => {
  it('names every component a file declares', () => {
    expect(problemsBeside('function Sidebar() {}')).toEqual([
      `${PAGE}: declares Home, Sidebar — one component or hook per file`,
    ]);
  });

  it('accepts a file declaring one component', () => {
    expect(
      componentPerFileProblems({ [PAGE]: 'export function Home() {}' }),
    ).toEqual([]);
  });

  it('reports only the files that declare more than one', () => {
    expect(
      componentPerFileProblems({
        [PAGE]: 'export function Home() {}',
        'src/elements/Board.tsx':
          'export function Board() {}\nfunction Square() {}',
      }),
    ).toEqual([
      'src/elements/Board.tsx: declares Board, Square — one component or hook per file',
    ]);
  });

  const counted = [
    'function Widget() {}',
    'export function Widget() {}',
    'export default function Widget() {}',
    'const Widget = () => null;',
    'export const Widget = (props: Props) => null;',
    'const Widget: FC<Props> = () => null;',
    'const Widget = function () {};',
    'const Widget = memo(() => null);',
    'const Widget = forwardRef((props, ref) => null);',
    'function useWidget() {}',
    'const useWidget = () => null;',
  ];

  it.each(counted)('counts %s', (declaration) => {
    expect(problemsBeside(declaration)).toHaveLength(1);
  });

  const ignored = [
    '  function Widget() {}',
    '  const Widget = () => null;',
    'function widget() {}',
    'const widget = () => null;',
    'function username() {}',
    'const WIDGET = () => null;',
    'const MAX_WIDGETS = 10;',
    'const Widget = 10;',
    'const Widget = buildWidget();',
    'const { Widget } = imports;',
    "import { Widget } from './Widget';",
    'export { Widget };',
  ];

  it.each(ignored)('ignores %s', (declaration) => {
    expect(problemsBeside(declaration)).toEqual([]);
  });
});

describe('isScannedModule', () => {
  const scanned = ['src/pages/Home/page.tsx', 'src/elements/readPlacement.ts'];

  it.each(scanned)('scans %s', (file) => {
    expect(isScannedModule(file)).toBe(true);
  });

  const skipped = [
    'src/pages/Home/page.test.tsx',
    'src/elements/readPlacement.test.ts',
    'src/tests-shared/renderRoute.tsx',
    'src/pages/Home/tests-shared/stub.ts',
    'src/theme.css',
    'src/elements/__snapshots__/page.snapshot.test.tsx.snap',
  ];

  it.each(skipped)('skips %s', (file) => {
    expect(isScannedModule(file)).toBe(false);
  });
});
