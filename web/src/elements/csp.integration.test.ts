import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import { build, createServer, preview, resolveConfig } from 'vite';
import type { InlineConfig, Plugin, Rolldown } from 'vite';
import { afterAll, beforeAll, expect, it, onTestFinished } from 'vitest';
import config from '../../vite.config';

const POLICY =
  "default-src 'self'; script-src 'self'; " +
  `connect-src ${new URL(import.meta.env.VITE_SUPABASE_URL).origin}; ` +
  "style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; " +
  "object-src 'none'; base-uri 'self'; form-action 'self'";

const app: InlineConfig = {
  ...config,
  // Relative to the repo root, where tests run. The config's own root is a URL
  // pathname, which a build cannot resolve on Windows.
  root: 'web',
  configFile: false,
  logLevel: 'silent',
};

// openProductionBuild exposes this to the page to report violations.
declare function reportViolation(directive: string): void;

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch();
});

afterAll(() => browser.close());

// Builds inside the test rather than in beforeAll, so a build that breaks fails
// the test. Stryker does not count a failed beforeAll as killing a mutant.
async function openProductionBuild() {
  await build(app);
  const server = await preview({ ...app, preview: { port: 0 } });
  onTestFinished(() => server.close());
  const page = await browser.newPage();
  const violations: string[] = [];
  await page.exposeFunction('reportViolation', (directive: string) =>
    violations.push(directive),
  );
  await page.addInitScript(() =>
    document.addEventListener('securitypolicyviolation', (event) =>
      reportViolation(event.effectiveDirective),
    ),
  );
  await page.goto(server.resolvedUrls!.local[0], { waitUntil: 'networkidle' });
  return { page, violations };
}

it('loads the production build without a CSP violation', async () => {
  // Given the production build

  // When it loads in Chromium
  const { violations } = await openProductionBuild();

  // Then nothing breaks the policy
  expect(violations).toEqual([]);
});

it('puts the policy first in <head>', async () => {
  // Given the production build

  // When it loads in Chromium
  const { page } = await openProductionBuild();

  // Then the first thing in <head> is the policy
  expect(
    await page.locator('head > :first-child').evaluate((tag) => tag.outerHTML),
  ).toBe(`<meta http-equiv="Content-Security-Policy" content="${POLICY}">`);
});

it('blocks an injected inline script', async () => {
  // Given the production build loaded in Chromium
  const { page } = await openProductionBuild();

  // When a script is injected inline
  const ran = await page.evaluate(() => {
    const script = document.createElement('script');
    script.textContent = 'document.body.dataset.injected = "ran"';
    document.head.append(script);
    return document.body.dataset.injected === 'ran';
  });

  // Then it does not run
  expect(ran).toBe(false);
});

it('keeps the policy ahead of tags other plugins put first in <head>', async () => {
  // Given a plugin that also puts a tag first in <head>
  const prepender: Plugin = {
    name: 'prepender',
    transformIndexHtml: () => [
      { tag: 'meta', attrs: { name: 'prepended' }, injectTo: 'head-prepend' },
    ],
  };

  // When the app builds with it
  const { output } = (await build({
    ...app,
    plugins: [config.plugins, prepender],
    build: { write: false },
  })) as Rolldown.RolldownOutput;

  // Then the policy is still first
  expect(output.find((file) => file.fileName === 'index.html')).toMatchObject({
    source: expect.stringMatching(
      /<head>\s*<meta http-equiv="Content-Security-Policy"/,
    ),
  });
});

it('inlines no assets into the production build', async () => {
  // Given the app config

  // When Vite resolves it for a build
  const resolved = await resolveConfig(app, 'build');

  // Then no asset is small enough to become a data: URI the policy blocks
  expect(resolved.build.assetsInlineLimit).toBe(0);
});

it('leaves the dev server without a policy', async () => {
  // Given the dev server
  const dev = await createServer({
    ...app,
    server: { middlewareMode: true, ws: false },
  });

  // When it serves the page
  const html = await dev.transformIndexHtml('/', '<head></head>');
  await dev.close();

  // Then the page has no policy
  expect(html).not.toContain('Content-Security-Policy');
});
