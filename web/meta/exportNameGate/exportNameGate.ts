import ts from 'typescript';
import { isScannedModule } from '../componentPerFileGate/componentPerFileGate';
import type { ModuleSources } from '../lowestCommonFolderGate/lowestCommonFolderGate';

type Export = { name: string; isType: boolean };

type Rule = { allowed: (entry: Export) => boolean; hint: string };

// A named bag of constants is the point of a *.constants.ts file.
const CONSTANTS = /\.constants\.ts$/;
const EXTENSION = /\.tsx?$/;
const PAGE = /\/page\.tsx$/;
const PASCAL_CASE = /^[A-Z][A-Za-z0-9]*$/;

export function exportNameProblems(sources: ModuleSources): string[] {
  return Object.entries(sources)
    .filter(([file]) => isCheckedModule(file))
    .flatMap(([file, text]) => {
      const entries = exportsOf(file, text);
      const { allowed, hint } = PAGE.test(file)
        ? pageRule(entries)
        : moduleRule(file);
      const wrong = entries.filter((entry) => !allowed(entry));
      if (wrong.length === 0) return [];
      return [
        `${file}: exports ${wrong.map((entry) => entry.name).join(', ')} — ${hint}`,
      ];
    });
}

const isCheckedModule = (file: string) =>
  isScannedModule(file) && !CONSTANTS.test(file);

function moduleRule(file: string): Rule {
  const segments = file.replace(EXTENSION, '').split('/');
  const expected = segments[segments.length - 1];
  const typeName = pascalCase(expected);
  return {
    allowed: (entry) =>
      entry.isType ? isTypeOf(entry, typeName) : entry.name === expected,
    hint: `export only ${expected} (types ${typeName} or ${typeName}Props)`,
  };
}

function pageRule(entries: Export[]): Rule {
  const values = entries.filter((entry) => !entry.isType);
  const component =
    values.length === 1 && PASCAL_CASE.test(values[0].name)
      ? values[0].name
      : undefined;
  return {
    allowed: (entry) =>
      component !== undefined &&
      (entry.isType ? isTypeOf(entry, component) : entry.name === component),
    hint: 'export only one PascalCase component (types <Name> or <Name>Props)',
  };
}

const isTypeOf = (entry: Export, name: string) =>
  entry.name === name || entry.name === `${name}Props`;

const pascalCase = (name: string) => name[0].toUpperCase() + name.slice(1);

function exportsOf(file: string, text: string): Export[] {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest);
  return source.statements.flatMap((statement) =>
    statementExports(statement, source),
  );
}

function statementExports(
  statement: ts.Statement,
  source: ts.SourceFile,
): Export[] {
  if (ts.isExportDeclaration(statement)) return listedExports(statement);
  if (ts.isExportAssignment(statement)) return [assignedExport(statement)];
  if (!isExported(statement)) return [];
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.map((declaration) => ({
      name: declaration.name.getText(source),
      isType: false,
    }));
  }
  return [declaredExport(statement)];
}

function listedExports(statement: ts.ExportDeclaration): Export[] {
  const clause = statement.exportClause;
  if (clause === undefined) return [{ name: '*', isType: false }];
  if (ts.isNamespaceExport(clause)) {
    return [{ name: clause.name.text, isType: statement.isTypeOnly }];
  }
  return clause.elements.map((element) => ({
    name: element.name.text,
    isType: statement.isTypeOnly || element.isTypeOnly,
  }));
}

const assignedExport = (statement: ts.ExportAssignment): Export => ({
  name: ts.isIdentifier(statement.expression)
    ? statement.expression.text
    : 'default',
  isType: false,
});

const declaredExport = (statement: ts.Statement): Export => ({
  // as-reason: statementExports only gets here with an exported declaration
  // other than a variable statement, and every such one is a DeclarationStatement.
  name: (statement as ts.DeclarationStatement).name?.text ?? 'default',
  isType:
    ts.isInterfaceDeclaration(statement) ||
    ts.isTypeAliasDeclaration(statement),
});

const isExported = (statement: ts.Statement) =>
  ts.canHaveModifiers(statement) &&
  (ts.getModifiers(statement) ?? []).some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
  );
