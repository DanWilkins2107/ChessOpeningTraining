const NAME = String.raw`[\w-]+`;
const EXT = String.raw`(?:tsx|ts|css|svg|constants\.ts|test\.ts|test\.tsx|snapshot\.test\.tsx|integration\.test\.ts|integration\.test\.tsx)`;
const SNAP = String.raw`snapshot\.test\.tsx\.snap`;

const IS_NAME = new RegExp(`^${NAME}$`);
const MODULE_FOLDERS = ['elements', 'shared'];
const RESERVED = [...MODULE_FOLDERS, 'tests-shared', '__snapshots__'];
const ROUTE_FOLDER = new RegExp(
  String.raw`^(?:${NAME}|\[${NAME}\]|\(${NAME}\))$`,
);
const TEST_HELPER = new RegExp(String.raw`^tests-shared/${NAME}\.ts$`);
const ASSET = new RegExp(String.raw`^(?:${NAME}\.svg|LICENSE\.txt)$`);
const companionOf = (base: string) =>
  new RegExp(String.raw`^(?:${base}\.${EXT}|__snapshots__/${base}\.${SNAP})$`);
const stemOf = (name: string) => name.replace(/\..*$/, '');

const inModuleFolder = ([folder, name, ...rest]: string[]) => {
  if (!MODULE_FOLDERS.includes(folder) || !IS_NAME.test(name)) return false;
  const file = rest.join('/');
  return companionOf(name).test(file) || ASSET.test(file);
};

const placedInLevel = (parts: string[]) =>
  TEST_HELPER.test(parts.join('/')) || inModuleFolder(parts);

const isRouteFolder = (folder: string) =>
  ROUTE_FOLDER.test(folder) && !RESERVED.includes(folder);

const placedInRoute = ([folder, ...rest]: string[]): boolean =>
  rest.length > 0 &&
  isRouteFolder(folder) &&
  (companionOf('page').test(rest.join('/')) ||
    placedInLevel(rest) ||
    placedInRoute(rest));

export const isPlaced = (path: string, rootExceptions: string[]) => {
  if (!path.includes('/')) {
    return rootExceptions.some((exception) =>
      companionOf(stemOf(exception)).test(path),
    );
  }
  const parts = path.split('/');
  return parts[0] === 'pages'
    ? placedInRoute(parts.slice(1))
    : placedInLevel(parts);
};
