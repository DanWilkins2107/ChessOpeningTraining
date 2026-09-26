import { describe, expect, it } from 'vitest';
import { exportNameProblems } from './exportNameGate';

const MODULE = 'src/elements/readPlacement/readPlacement.ts';
const HINT =
  'export only readPlacement (types ReadPlacement or ReadPlacementProps)';

const problemsIn = (text: string, file = MODULE) =>
  exportNameProblems({ [file]: text });

describe('exportNameProblems', () => {
  const accepted = [
    'export function readPlacement() {}',
    'export const readPlacement = () => null;',
    'export default function readPlacement() {}',
    'const readPlacement = 1;\nexport default readPlacement;',
    'const readPlacement = 1;\nexport { readPlacement };',
    "export { readPlacement } from './other';",
    'export type ReadPlacement = string;',
    'export interface ReadPlacementProps {}',
    'type Local = 1;\nexport type { Local as ReadPlacement };',
    'export { type ReadPlacementProps } from "./other";',
    'function helper() {}\nconst other = 1;\nhelper();',
  ];

  it.each(accepted)('accepts %s', (text) => {
    expect(problemsIn(text)).toEqual([]);
  });

  const rejected: [string, string][] = [
    ['export function meetsRule() {}', 'meetsRule'],
    ['export const a = 1, readPlacement = 2;', 'a'],
    ['export const { readPlacement } = imports;', '{ readPlacement }'],
    ['export default function other() {}', 'other'],
    ['export default function () {}', 'default'],
    ['export default 1;', 'default'],
    ['export = other;', 'other'],
    ['const other = 1;\nexport { other };', 'other'],
    ['export { readPlacement as other };', 'other'],
    ["export * from './other';", '*'],
    ["export * as other from './other';", 'other'],
    ['export type Other = string;', 'Other'],
    ['export type readPlacement = string;', 'readPlacement'],
    ['export interface ReadPlacementState {}', 'ReadPlacementState'],
    ['export class Other {}', 'Other'],
    ['export enum ReadPlacement {}', 'ReadPlacement'],
  ];

  it.each(rejected)('rejects %s', (text, name) => {
    expect(problemsIn(text)).toEqual([`${MODULE}: exports ${name} — ${HINT}`]);
  });

  it('lists every wrong name a file exports', () => {
    expect(
      problemsIn(
        'export const a = 1;\nexport function readPlacement() {}\nexport type B = 1;',
      ),
    ).toEqual([`${MODULE}: exports a, B — ${HINT}`]);
  });

  it('names a page after its folder', () => {
    const page = 'src/pages/Home/page.tsx';
    expect(problemsIn('export function Home() {}', page)).toEqual([]);
    expect(problemsIn('export function page() {}', page)).toEqual([
      `${page}: exports page — export only Home (types Home or HomeProps)`,
    ]);
  });

  it('names a component module after its file', () => {
    expect(
      problemsIn(
        'export type BoardProps = {};\nexport function Board() {}',
        'src/elements/Board/Board.tsx',
      ),
    ).toEqual([]);
  });

  it('reports only the files that break the rule', () => {
    expect(
      exportNameProblems({
        [MODULE]: 'export function readPlacement() {}',
        'src/shared/fen/fen.ts': 'export const FILES = [];',
      }),
    ).toEqual([
      'src/shared/fen/fen.ts: exports FILES — export only fen (types Fen or FenProps)',
    ]);
  });
});

describe('checked modules', () => {
  const skipped = [
    'src/shared/useUser/useUser.constants.ts',
    'src/pages/Home/page.test.tsx',
    'src/tests-shared/renderRoute.tsx',
    'src/theme.css',
  ];

  it.each(skipped)('skips %s', (file) => {
    expect(problemsIn('export const OTHER = 1;', file)).toEqual([]);
  });
});
