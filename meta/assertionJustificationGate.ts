import ts from 'typescript';
import { reasonAbove } from './shared/reasonAbove';
import { problemsIn, trackedTypeScript } from './shared/trackedTypeScript';

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
    if (isAssertion(node) && !isConstAssertion(node)) found.push(node);
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(source, visit);
  return found;
}

const isAssertion = (
  node: ts.Node,
): node is ts.AsExpression | ts.TypeAssertion =>
  ts.isAsExpression(node) || ts.isTypeAssertionExpression(node);

const isConstAssertion = (node: ts.AsExpression | ts.TypeAssertion) =>
  ts.isConstTypeReference(node.type);

const startLine = (source: ts.SourceFile, node: ts.Node) =>
  source.getLineAndCharacterOfPosition(node.getStart(source)).line;

export function unjustifiedAssertions(): string[] {
  return problemsIn(trackedTypeScript(), unjustifiedCasts);
}
