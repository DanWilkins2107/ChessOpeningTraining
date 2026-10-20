import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  renderTemplate,
  templateProblems,
  writeTemplates,
} from './emailTemplates';

const LAYOUT = '<html><body>\n<!-- BODY -->\n</body></html>\n';

describe('renderTemplate', () => {
  it('fills the body slot and leaves Supabase tags untouched', () => {
    expect(
      renderTemplate(LAYOUT, '<a href="{{ .ConfirmationURL }}">Go</a>\n'),
    ).toBe(
      '<html><body>\n<a href="{{ .ConfirmationURL }}">Go</a>\n</body></html>\n',
    );
  });

  it('inserts replacement patterns like $& literally', () => {
    expect(renderTemplate('<!-- BODY -->', 'Costs $& more')).toBe(
      'Costs $& more',
    );
  });

  it('rejects a layout without a body slot', () => {
    expect(() => renderTemplate('<html></html>', 'x')).toThrow(
      'layout.html must contain <!-- BODY --> exactly once',
    );
  });

  it('rejects a layout with two body slots', () => {
    expect(() => renderTemplate('<!-- BODY --><!-- BODY -->', 'x')).toThrow(
      'layout.html must contain <!-- BODY --> exactly once',
    );
  });
});

describe('templates folder', () => {
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

  it('writes one finished template per body fragment', () => {
    writeTemplates(dir);

    expect(read('confirmation.html')).toBe(
      '<html><body>\n<p>Confirm</p>\n</body></html>\n',
    );
    expect(read('recovery.html')).toBe(
      '<html><body>\n<p>Reset</p>\n</body></html>\n',
    );
  });

  it('finds no problems once built', () => {
    writeTemplates(dir);

    expect(templateProblems(dir)).toEqual([]);
  });

  it('finds no problems when there are no fragments, even without a layout', () => {
    rmSync(path.join(dir, 'bodies'), { recursive: true });
    mkdirSync(path.join(dir, 'bodies'));
    rmSync(path.join(dir, 'layout.html'));

    expect(templateProblems(dir)).toEqual([]);
  });

  it('reports missing, stale and orphaned templates', () => {
    writeTemplates(dir);
    rmSync(path.join(dir, 'confirmation.html'));
    write('bodies/recovery.html', '<p>Reset now</p>');
    write('invite.html', '<p>Old</p>');

    expect(templateProblems(dir)).toEqual([
      `${dir}/invite.html: orphaned, no bodies/invite.html builds it`,
      `${dir}/confirmation.html: missing, run npm run email:build`,
      `${dir}/recovery.html: stale, run npm run email:build`,
    ]);
  });
});
