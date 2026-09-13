import { chromium } from 'playwright';
import type { Browser } from 'playwright';
import { build, preview, resolveConfig } from 'vite';
import type { InlineConfig, Plugin, Rolldown } from 'vite';
import { afterAll, beforeAll, expect, it, onTestFinished } from 'vitest';
import config from '../../vite.config';

const ATTACKER = 'https://attacker.example';

const app: InlineConfig = {
  ...config,
  // Relative to the repo root, where tests run. The config's own root is a URL
  // pathname, which a build cannot resolve on Windows.
  root: 'web',
  configFile: false,
  logLevel: 'silent',
};

type Violation = { directive: string; blocked: string };

// openProductionBuild exposes this to the page to report violations.
declare function reportViolation(violation: Violation): void;

// Chromium reports the blocked URL in a different shape per directive.
const blockedFromAttacker = (directive: string) => ({
  directive,
  blocked: expect.stringContaining(ATTACKER),
});

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
  const violations: Violation[] = [];
  await page.exposeFunction('reportViolation', (violation: Violation) =>
    violations.push(violation),
  );
  await page.addInitScript(() =>
    document.addEventListener('securitypolicyviolation', (event) =>
      reportViolation({
        directive: event.effectiveDirective,
        blocked: event.blockedURI,
      }),
    ),
  );
  await page.goto(server.resolvedUrls!.local[0], { waitUntil: 'networkidle' });
  return { page, violations };
}

async function violationsFrom(attack: (attacker: string) => unknown) {
  const { page, violations } = await openProductionBuild();
  await page.evaluate(attack, ATTACKER);
  await expect.poll(() => violations).not.toEqual([]);
  return violations;
}

it('loads the production build without a CSP violation', async () => {
  // Given the production build

  // When it loads in Chromium
  const { violations } = await openProductionBuild();

  // Then nothing breaks the policy
  expect(violations).toEqual([]);
});

it('blocks an injected inline script', async () => {
  // Given the production build loaded in Chromium

  // When a script is injected inline
  const violations = await violationsFrom(() => {
    const script = document.createElement('script');
    script.textContent = 'document.body.dataset.injected = "ran"';
    document.head.append(script);
  });

  // Then it is blocked
  expect(violations).toEqual([
    { directive: 'script-src-elem', blocked: 'inline' },
  ]);
});

it('blocks a script from another origin', async () => {
  // Given the production build loaded in Chromium

  // When a script from another origin is injected
  const violations = await violationsFrom((attacker) => {
    const script = document.createElement('script');
    script.src = attacker;
    document.head.append(script);
  });

  // Then it is blocked
  expect(violations).toEqual([blockedFromAttacker('script-src-elem')]);
});

it('lets the app reach Supabase but blocks requests anywhere else', async () => {
  // Given the production build loaded in Chromium
  const { page, violations } = await openProductionBuild();

  // When it requests Supabase, then another origin
  await page.evaluate(
    async (urls) => {
      for (const url of urls) {
        await fetch(url).catch(() => undefined);
      }
    },
    [import.meta.env.VITE_SUPABASE_URL, ATTACKER],
  );

  // Then only the other origin is blocked
  await expect
    .poll(() => violations)
    .toEqual([blockedFromAttacker('connect-src')]);
});

it('blocks an injected <object>', async () => {
  // Given the production build loaded in Chromium

  // When an <object> is injected
  const violations = await violationsFrom((attacker) => {
    const object = document.createElement('object');
    object.data = attacker;
    document.body.append(object);
  });

  // Then it is blocked
  expect(violations).toEqual([blockedFromAttacker('object-src')]);
});

it('blocks a <base> that points relative URLs at another origin', async () => {
  // Given the production build loaded in Chromium

  // When a <base> for another origin is injected
  const violations = await violationsFrom((attacker) => {
    const base = document.createElement('base');
    base.href = attacker;
    document.head.append(base);
  });

  // Then it is blocked
  expect(violations).toEqual([blockedFromAttacker('base-uri')]);
});

it('blocks a form posting to another origin', async () => {
  // Given the production build loaded in Chromium

  // When a form for another origin is submitted
  const violations = await violationsFrom((attacker) => {
    const form = document.createElement('form');
    form.action = attacker;
    document.body.append(form);
    form.submit();
  });

  // Then it is blocked
  expect(violations).toEqual([blockedFromAttacker('form-action')]);
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
