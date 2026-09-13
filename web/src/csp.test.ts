// @vitest-environment node
import { build, createServer } from 'vite';
import type { Plugin, Rolldown } from 'vite';
import { expect, it } from 'vitest';
import indexHtml from '../index.html?raw';
import config from '../vite.config';
import { sha256 } from './csp';

const FIRST_IN_HEAD =
  /^<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta http-equiv="Content-Security-Policy" content="([^"]*)">/;

const STRICT_TAIL =
  "font-src https://fonts.gstatic.com; object-src 'none'; base-uri 'self'; form-action 'self'";

function policyOf(html: string) {
  const content = FIRST_IN_HEAD.exec(html)?.[1];
  expect(content, 'CSP meta is not first in <head>').toBeDefined();
  return content?.replaceAll('&#39;', "'");
}

const laterHeadTag: Plugin = {
  name: 'later-head-tag',
  transformIndexHtml: () => [{ tag: 'script', attrs: { src: '/later.js' } }],
};

it('hashes to base64 sha256', async () => {
  expect(await sha256('abc')).toBe(
    'ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0=',
  );
});

it('builds the strict policy first in <head>, ahead of later plugins, without dev additions', async () => {
  const { output } = (await build({
    ...config,
    plugins: [config.plugins, laterHeadTag],
    configFile: false,
    // The config's URL-pathname root does not resolve on Windows at build.
    root: 'web',
    logLevel: 'silent',
    build: { write: false },
  })) as Rolldown.RolldownOutput;
  const html = String(
    output.find(
      (file): file is Rolldown.OutputAsset =>
        file.type === 'asset' && file.fileName === 'index.html',
    )?.source,
  );

  expect(policyOf(html)).toBe(
    "default-src 'self'; script-src 'self'; connect-src https://project-ref.supabase.co; " +
      `style-src 'self' https://fonts.googleapis.com; ${STRICT_TAIL}`,
  );
  expect(html).not.toContain('nonce');
});

it('serves the policy first in <head>, adding only the refresh preamble, style nonce and HMR', async () => {
  const server = await createServer({
    ...config,
    configFile: false,
    logLevel: 'silent',
    server: { middlewareMode: true, ws: false },
  });
  const html = await server.transformIndexHtml('/', indexHtml);
  await server.close();

  const preamble = /<script type="module" nonce="[^"]+">([^<]+)<\/script>/.exec(
    html,
  )?.[1];
  const nonce = /<meta property="csp-nonce" nonce="([^"]+)">/.exec(html)?.[1];
  expect(preamble).toContain('injectIntoGlobalHook');
  expect(policyOf(html)).toBe(
    `default-src 'self'; script-src 'self' 'sha256-${await sha256(String(preamble))}'; ` +
      "connect-src https://project-ref.supabase.co 'self'; " +
      `style-src 'self' https://fonts.googleapis.com 'nonce-${nonce}'; ${STRICT_TAIL}`,
  );
  expect(server.config.build.assetsInlineLimit).toBe(0);
});
