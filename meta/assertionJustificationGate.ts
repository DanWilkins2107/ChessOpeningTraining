import ts from 'typescript';
import { reasonAbove } from './reasonAbove';
import { problemsIn, trackedTypeScript } from './trackedTypeScript';

const MARKER = 'as-reason';

const FORMAT = `// ${MARKER}: <why the type can't be expressed without it>`;

export function unjustifiedCasts(file: string, text: string): string[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest);
  const lines = text.split(/\r?\n/);

  return assertionsIn(source)
    .map((node) => startLine(source, node))
    .filter((index) => !reasonAbove(lines, index, MARKER))
    .map((index) => `${index + 1}: type assertion needs "${FORMAT}" above it`);
}

function assertionsIn(source: ts.SourceFile): ts.Node[] {
  const found: ts.Node[] = [];
  const visit = (node: ts.Node) => {
    if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
      found.push(node);
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(source, visit);
  return found;
}

const startLine = (source: ts.SourceFile, node: ts.Node) =>
  source.getLineAndCharacterOfPosition(node.getStart(source)).line;

export function unjustifiedAssertions(): string[] {
  return problemsIn(trackedTypeScript(), unjustifiedCasts);
}
