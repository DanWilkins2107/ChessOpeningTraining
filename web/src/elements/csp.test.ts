// @vitest-environment node
import { build, createServer } from 'vite';
import type { Plugin, ResolvedConfig, Rolldown } from 'vite';
import { expect, it } from 'vitest';
import indexHtml from '../../index.html?raw';
import config from '../../vite.config';

const FIRST_IN_HEAD =
  /^<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta http-equiv="Content-Security-Policy" content="([^"]*)">/;

it('builds the strict policy first in <head>, ahead of later plugins', async () => {
  let resolved: ResolvedConfig | undefined;
  const laterPlugin: Plugin = {
    name: 'later-plugin',
    configResolved: (config) => {
      resolved = config;
    },
    transformIndexHtml: () => [{ tag: 'script', attrs: { src: '/later.js' } }],
  };
  const { output } = (await build({
    ...config,
    plugins: [config.plugins, laterPlugin],
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

  expect(FIRST_IN_HEAD.exec(html)?.[1]?.replaceAll('&#39;', "'")).toBe(
    "default-src 'self'; script-src 'self'; connect-src https://project-ref.supabase.co; " +
      "style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; " +
      "object-src 'none'; base-uri 'self'; form-action 'self'",
  );
  expect(resolved?.build.assetsInlineLimit).toBe(0);
});

it('leaves the dev server without a policy', async () => {
  const server = await createServer({
    ...config,
    configFile: false,
    logLevel: 'silent',
    server: { middlewareMode: true, ws: false },
  });
  const html = await server.transformIndexHtml('/', indexHtml);
  await server.close();

  expect(html).toContain('injectIntoGlobalHook');
  expect(html).not.toContain('Content-Security-Policy');
});
