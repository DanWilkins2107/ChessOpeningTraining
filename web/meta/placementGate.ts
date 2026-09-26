const NAME = String.raw`[\w-]+`;
const EXT = String.raw`(?:tsx|ts|css|svg|constants\.ts|test\.ts|test\.tsx|snapshot\.test\.tsx|integration\.test\.ts|integration\.test\.tsx)`;
const SNAP = String.raw`snapshot\.test\.tsx\.snap`;

const IS_NAME = new RegExp(`^${NAME}$`);
const MODULE_FOLDERS = ['elements', 'shared'];
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

const placedInPage = ([page, ...rest]: string[]) =>
  IS_NAME.test(page) &&
  (companionOf('page').test(rest.join('/')) || placedInLevel(rest));

export const isPlaced = (path: string, rootExceptions: string[]) => {
  if (!path.includes('/')) {
    return rootExceptions.some((exception) =>
      companionOf(stemOf(exception)).test(path),
    );
  }
  const parts = path.split('/');
  return parts[0] === 'pages'
    ? placedInPage(parts.slice(1))
    : placedInLevel(parts);
};
