import { PluginKind, declareValuePlugin } from '@stryker-mutator/api/plugin';

const HOOKS_WITH_DEPENDENCIES = new Set([
  'useCallback',
  'useEffect',
  'useImperativeHandle',
  'useInsertionEffect',
  'useLayoutEffect',
  'useMemo',
]);

const isEmptyHookDependencyList = (path) =>
  path.isArrayExpression() &&
  path.node.elements.length === 0 &&
  path.parentPath.isCallExpression() &&
  path.parentPath.node.arguments.at(-1) === path.node &&
  HOOKS_WITH_DEPENDENCIES.has(path.parentPath.node.callee.name);

export const strykerPlugins = [
  declareValuePlugin(PluginKind.Ignore, 'empty-hook-dependencies', {
    shouldIgnore: (path) =>
      isEmptyHookDependencyList(path)
        ? 'Any constant dependency list runs the hook once, just like [].'
        : undefined,
  }),
];
