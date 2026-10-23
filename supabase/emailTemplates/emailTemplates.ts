import {
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

const CONTENT_SLOT = '<!-- insert content here -->';
const LAYOUT = 'layout.html';
const BODIES = 'bodies';
const BUILT = 'built';
const HTML = /\.html$/;

export function renderTemplate(layout: string, body: string): string {
  const [before, after, ...extra] = layout.split(CONTENT_SLOT);
  if (after === undefined || extra.length > 0) {
    throw new Error(`${LAYOUT} must contain ${CONTENT_SLOT} exactly once`);
  }
  return before + body.trimEnd() + after;
}

export function writeTemplates(templatesDir: string): void {
  const bodiesDir = path.join(templatesDir, BODIES);
  const builtDir = path.join(templatesDir, BUILT);
  const layout = readFileSync(path.join(templatesDir, LAYOUT), 'utf8');

  rmSync(builtDir, { recursive: true, force: true });
  mkdirSync(builtDir);
  for (const name of readdirSync(bodiesDir).filter((n) => HTML.test(n))) {
    const body = readFileSync(path.join(bodiesDir, name), 'utf8');
    writeFileSync(path.join(builtDir, name), renderTemplate(layout, body));
  }
}
