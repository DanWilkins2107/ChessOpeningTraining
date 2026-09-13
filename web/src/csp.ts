import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { z } from 'zod';

// Vite injects dev CSS as <style> tags, so dev needs a style nonce. A fixed
// nonce defends nothing, so it must never reach a build.
const DEV_STYLE_NONCE = 'vite-dev-styles';

export async function sha256(text: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(text),
  );
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

export function csp(): Plugin {
  let supabaseOrigin: string;
  let base: string;

  return {
    // Stryker disable next-line StringLiteral: the name is only a label in
    // Vite's logs, so no test can observe it.
    name: 'csp',
    config: (_config, { command }) => ({
      build: { assetsInlineLimit: 0 },
      html: command === 'serve' ? { cspNonce: DEV_STYLE_NONCE } : {},
    }),
    configResolved(config) {
      supabaseOrigin = new URL(z.url().parse(config.env.VITE_SUPABASE_URL))
        .origin;
      base = config.base;
    },
    transformIndexHtml: {
      // Post, so the policy is prepended after every other plugin's tags and
      // so precedes them.
      order: 'post',
      async handler(_html, { server }) {
        const directives: Record<string, string[]> = {
          'default-src': ["'self'"],
          'script-src': ["'self'"],
          'connect-src': [supabaseOrigin],
          'style-src': ["'self'", 'https://fonts.googleapis.com'],
          'font-src': ['https://fonts.gstatic.com'],
          'object-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
        };
        if (server) {
          const preamble = react.preambleCode.replace('__BASE__', base);
          directives['script-src'].push(`'sha256-${await sha256(preamble)}'`);
          directives['style-src'].push(`'nonce-${DEV_STYLE_NONCE}'`);
          // The HMR websocket.
          directives['connect-src'].push("'self'");
        }

        const content = Object.entries(directives)
          .map((directive) => directive.flat().join(' '))
          .join('; ');
        return [
          {
            tag: 'meta',
            attrs: { 'http-equiv': 'Content-Security-Policy', content },
          },
        ];
      },
    },
  };
}
