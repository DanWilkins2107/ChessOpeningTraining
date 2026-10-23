import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { renderTemplate, writeTemplates } from './emailTemplates';

const SLOT = '<!-- insert content here -->';
const LAYOUT = `<html><body>\n${SLOT}\n</body></html>\n`;
const SLOT_ERROR = `layout.html must contain ${SLOT} exactly once`;

describe('renderTemplate', () => {
  it('fills the content slot and leaves Supabase tags untouched', () => {
    expect(
      renderTemplate(LAYOUT, '<a href="{{ .ConfirmationURL }}">Go</a>\n'),
    ).toBe(
      '<html><body>\n<a href="{{ .ConfirmationURL }}">Go</a>\n</body></html>\n',
    );
  });

  it('inserts replacement patterns like $& literally', () => {
    expect(renderTemplate(SLOT, 'Costs $& more')).toBe('Costs $& more');
  });

  it('rejects a layout without a content slot', () => {
    expect(() => renderTemplate('<html></html>', 'x')).toThrow(SLOT_ERROR);
  });

  it('rejects a layout with two content slots', () => {
    expect(() => renderTemplate(SLOT + SLOT, 'x')).toThrow(SLOT_ERROR);
  });
});

describe('writeTemplates', () => {
  let dir: string;
  const write = (file: string, text: string) =>
    writeFileSync(path.join(dir, file), text);
  const read = (file: string) => readFileSync(path.join(dir, file), 'utf8');

  beforeEach(() => {
    dir = mkdtempSync(path.join(tmpdir(), 'email-templates-'));
    mkdirSync(path.join(dir, 'bodies'));
    write('layout.html', LAYOUT);
    write('bodies/confirmation.html', '<p>Confirm</p>');
    write('bodies/recovery.html', '<p>Reset</p>');
    write('bodies/notes.txt', 'not a fragment');
  });

  afterEach(() => rmSync(dir, { recursive: true }));

  it('writes one finished template per body fragment into built/', () => {
    writeTemplates(dir);

    expect(read('built/confirmation.html')).toBe(
      '<html><body>\n<p>Confirm</p>\n</body></html>\n',
    );
    expect(read('built/recovery.html')).toBe(
      '<html><body>\n<p>Reset</p>\n</body></html>\n',
    );
    expect(existsSync(path.join(dir, 'built/notes.txt'))).toBe(false);
  });

  it('clears templates whose fragment has gone', () => {
    writeTemplates(dir);
    rmSync(path.join(dir, 'bodies/recovery.html'));

    writeTemplates(dir);

    expect(existsSync(path.join(dir, 'built/recovery.html'))).toBe(false);
    expect(existsSync(path.join(dir, 'built/confirmation.html'))).toBe(true);
  });
});
