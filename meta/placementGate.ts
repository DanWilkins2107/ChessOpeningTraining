const NAME = String.raw`[\w-]+`;
const EXT = String.raw`(?:tsx|ts|css|test\.ts|test\.tsx|snapshot\.test\.tsx)`;
const SNAP = String.raw`snapshot\.test\.tsx\.snap`;

const IS_NAME = new RegExp(`^${NAME}$`);
const LEAF = new RegExp(
  String.raw`^elements/(?:${NAME}\.${EXT}|__snapshots__/${NAME}\.${SNAP})$`,
);
const companionOf = (base: string) =>
  new RegExp(String.raw`^(?:${base}\.${EXT}|__snapshots__/${base}\.${SNAP})$`);
const stemOf = (name: string) => name.replace(/\..*$/, '');

const pageBase = (page: string) => (IS_NAME.test(page) ? 'page' : null);

const elementBase = (dir: string, name: string) =>
  dir === 'elements' && name !== '__snapshots__' && IS_NAME.test(name)
    ? name
    : null;

const folderBase = (parts: string[], base: string) => {
  if (parts.length <= 2) return null;
  const [dir, name] = parts;
  return base === '' && dir === 'pages'
    ? pageBase(name)
    : elementBase(dir, name);
};

const placedUnder = (parts: string[], base: string): boolean => {
  const nested = folderBase(parts, base);
  if (nested !== null) return placedUnder(parts.slice(2), nested);

  const rest = parts.join('/');
  return LEAF.test(rest) || (base !== '' && companionOf(base).test(rest));
};

export const isPlaced = (path: string, rootExceptions: string[]) =>
  path.includes('/')
    ? placedUnder(path.split('/'), '')
    : rootExceptions.some((exception) =>
        companionOf(stemOf(exception)).test(path),
      );
