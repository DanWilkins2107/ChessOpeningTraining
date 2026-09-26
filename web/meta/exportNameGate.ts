import ts from 'typescript';
import { isScannedModule } from './componentPerFileGate';
import type { ModuleSources } from './lowestCommonFolderGate';

type Export = { name: string; isType: boolean };

// A named bag of constants is the point of a *.constants.ts file.
const CONSTANTS = /\.constants\.ts$/;
const EXTENSION = /\.tsx?$/;

export function exportNameProblems(sources: ModuleSources): string[] {
  return Object.entries(sources)
    .filter(([file]) => isCheckedModule(file))
    .flatMap(([file, text]) => {
      const expected = expectedName(file);
      const typeName = pascalCase(expected);
      const allowed = (entry: Export) =>
        entry.isType
          ? entry.name === typeName || entry.name === `${typeName}Props`
          : entry.name === expected;
      const wrong = exportsOf(file, text).filter((entry) => !allowed(entry));
      if (wrong.length === 0) return [];
      return [
        `${file}: exports ${wrong.map((entry) => entry.name).join(', ')} — export only ${expected} (types ${typeName} or ${typeName}Props)`,
      ];
    });
}

const isCheckedModule = (file: string) =>
  isScannedModule(file) && !CONSTANTS.test(file);

function expectedName(file: string): string {
  const segments = file.replace(EXTENSION, '').split('/');
  const basename = segments[segments.length - 1];
  return basename === 'page' ? segments[segments.length - 2] : basename;
}

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
