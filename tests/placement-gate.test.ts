import { expect, it } from 'vitest';

const ROOT_EXCEPTIONS = ['main.tsx', 'theme.css', 'env.ts'];
const NAME = String.raw`[\w-]+`;
const EXT = String.raw`(?:tsx|ts|css|test\.ts|test\.tsx|snapshot\.test\.tsx)`;
const SNAP = String.raw`snapshot\.test\.tsx\.snap`;

const IS_NAME = new RegExp(`^${NAME}$`);
const LEAF = new RegExp(
  String.raw`^elements/(?:${NAME}\.${EXT}|__snapshots__/${NAME}\.${SNAP})$`,
);
const companionOf = (base: string) =>
  new RegExp(String.raw`^(?:${base}\.${EXT}|__snapshots__/${base}\.${SNAP})$`);

export const isPlaced = (path: string) => {
  const parts = path.split('/');
  if (parts.length === 1) return ROOT_EXCEPTIONS.includes(path);

  let base = '';
  const [top = '', page = ''] = parts;
  if (top === 'pages' && parts.length > 2 && IS_NAME.test(page)) {
    base = 'page';
    parts.splice(0, 2);
  }

  while (parts.length > 2) {
    const [dir = '', name = ''] = parts;
    if (dir !== 'elements' || name === '__snapshots__' || !IS_NAME.test(name))
      break;
    base = name;
    parts.splice(0, 2);
  }

  const rest = parts.join('/');
  return LEAF.test(rest) || (base !== '' && companionOf(base).test(rest));
};

const modules = Object.keys(import.meta.glob('../src/**/*')).map((key) =>
  key.replace('../src/', ''),
);

it('every module sits in a page folder or an elements folder', () => {
  expect(modules.length).toBeGreaterThan(0);
  expect(modules.filter((path) => !isPlaced(path))).toEqual([]);
});
