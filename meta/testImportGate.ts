import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { consumersByModule } from './importGraph';
import type { ModuleSources } from './importGraph';

const SCANNED_FOLDERS = ['web/src', 'web/meta', 'meta'];
const SOURCE = /\.tsx?$/;
const TEST = /\.test\.tsx?$/;

const repoRoot = path.join(import.meta.dirname, '..');

export function repoSources(): ModuleSources {
  return Object.fromEntries(
    trackedModules().map((file) => [
      file,
      readFileSync(path.join(repoRoot, file), 'utf8'),
    ]),
  );
}

export function testImportProblems(sources: ModuleSources): string[] {
  return Object.entries(consumersByModule(sources))
    .filter(([modulePath]) => isTestSide(modulePath))
    .flatMap(([modulePath, consumers]) =>
      consumers
        .filter((consumer) => !isTestSide(consumer))
        .map(
          (consumer) =>
            `${consumer}: imports ${modulePath}, which only tests may import`,
        ),
    );
}

export function singleImporterProblems(sources: ModuleSources): string[] {
  return Object.entries(consumersByModule(sources))
    .filter(
      ([modulePath, consumers]) =>
        isTestHelper(modulePath) && consumers.length === 1,
    )
    .map(
      ([modulePath, [consumer]]) =>
        `${modulePath}: only ${consumer} imports it, so inline it there`,
    );
}

const isTestHelper = (modulePath: string) =>
  modulePath.split('/').includes('tests-shared');

const isTestSide = (modulePath: string) =>
  TEST.test(modulePath) || isTestHelper(modulePath);

function trackedModules(): string[] {
  return execFileSync('git', ['ls-files', '-z', ...SCANNED_FOLDERS], {
    cwd: repoRoot,
  })
    .toString('utf8')
    .split('\0')
    .filter((file) => SOURCE.test(file));
}
