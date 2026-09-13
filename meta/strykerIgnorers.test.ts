import { Instrumenter } from '@stryker-mutator/instrumenter';
import { expect, it } from 'vitest';
import { strykerPlugins } from './strykerIgnorers.js';

const silentLogger = {
  debug: () => undefined,
  info: () => undefined,
  isDebugEnabled: () => false,
};

async function arrayMutantStatuses(code: string) {
  const instrumenter = new Instrumenter(silentLogger as never);
  const { mutants } = await instrumenter.instrument(
    [{ name: 'hook.ts', content: code, mutate: true }],
    {
      plugins: null,
      excludedMutations: [],
      ignorers: strykerPlugins.map((plugin) => plugin.value),
    },
  );
  return mutants
    .filter((mutant) => mutant.mutatorName === 'ArrayDeclaration')
    .map((mutant) => mutant.status ?? 'mutated');
}

it.each([
  ['an empty useEffect dependency list', 'useEffect(() => run(), []);'],
  ['an empty useMemo dependency list', 'useMemo(() => build(), []);'],
])('ignores %s', async (_name, code) => {
  expect(await arrayMutantStatuses(code)).toEqual(['Ignored']);
});

it.each([
  ['a non-empty dependency list', 'useEffect(() => run(id), [id]);'],
  ['an empty array outside a call', 'const list = [];'],
  ['an empty array that is not the last argument', 'useEffect([], run);'],
  ['an empty array passed to a function that is not a hook', 'run(go, []);'],
])('still mutates %s', async (_name, code) => {
  expect(await arrayMutantStatuses(code)).toEqual(['mutated']);
});
