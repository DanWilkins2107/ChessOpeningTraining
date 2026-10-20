import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BODY_SLOT = '<!-- BODY -->';
const LAYOUT = 'layout.html';
const BODIES = 'bodies';
const HTML = /\.html$/;

export function renderTemplate(layout: string, body: string): string {
  const [before, after, ...extra] = layout.split(BODY_SLOT);
  if (after === undefined || extra.length > 0) {
    throw new Error(`${LAYOUT} must contain ${BODY_SLOT} exactly once`);
  }
  return before + body.trimEnd() + after;
}

function renderTemplates(templatesDir: string): Map<string, string> {
  const bodiesDir = path.join(templatesDir, BODIES);
  return new Map(
    htmlFiles(bodiesDir).map((name) => [
      name,
      renderTemplate(
        readFileSync(path.join(templatesDir, LAYOUT), 'utf8'),
        readFileSync(path.join(bodiesDir, name), 'utf8'),
      ),
    ]),
  );
}

export function writeTemplates(templatesDir: string): void {
  for (const [name, html] of renderTemplates(templatesDir)) {
    writeFileSync(path.join(templatesDir, name), html);
  }
}

export function templateProblems(templatesDir: string): string[] {
  const expected = renderTemplates(templatesDir);
  const written = htmlFiles(templatesDir).filter((name) => name !== LAYOUT);
  const label = (name: string) => `${templatesDir}/${name}`;

  const orphaned = written
    .filter((name) => !expected.has(name))
    .map((name) => `${label(name)}: orphaned, no ${BODIES}/${name} builds it`);
  const outOfDate = [...expected].flatMap(([name, html]) => {
    if (!written.includes(name)) {
      return [`${label(name)}: missing, run npm run email:build`];
    }
    return readFileSync(path.join(templatesDir, name), 'utf8') === html
      ? []
      : [`${label(name)}: stale, run npm run email:build`];
  });

  return [...orphaned, ...outOfDate];
}

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).filter((name) => HTML.test(name));
}
