import { reasonAbove } from './shared/reasonAbove';
import { gateFilePrefix } from './repoPaths';
import { problemsIn, trackedTypeScript } from './shared/trackedTypeScript';

const MARKER = 'mock-reason';

const FORMAT = `// ${MARKER}: <why the real thing can't be used>`;

const CALL = /\bvi\.(mock|doMock|stubEnv|stubGlobal|spyOn|hoisted)\s*\(/;

const ownFiles = gateFilePrefix(import.meta.filename);

export function unjustifiedCalls(text: string): string[] {
  const lines = text.split(/\r?\n/);

  return lines.flatMap((line, index) => {
    const call = CALL.exec(line);
    if (call === null || reasonAbove(lines, index, MARKER)) return [];
    return [`${index + 1}: vi.${call[1]} needs "${FORMAT}" above it`];
  });
}

export function unjustifiedMocks(): string[] {
  const scanned = trackedTypeScript().filter(
    (file) => !file.startsWith(ownFiles),
  );
  return problemsIn(scanned, (_file, text) => unjustifiedCalls(text));
}
