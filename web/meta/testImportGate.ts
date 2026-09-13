import { consumersByModule, isTestSide } from './lowestCommonFolderGate';
import type { ModuleSources } from './lowestCommonFolderGate';

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
