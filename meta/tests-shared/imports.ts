export const imports = (...targets: string[]) =>
  targets.map((target) => `import { x } from '${target}';`).join('\n');
