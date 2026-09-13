import type { Plugin } from 'vite';
import { z } from 'zod';
import {
  CSP_COMMAND,
  CSP_DIRECTIVES,
  CSP_PLUGIN_NAME,
} from './csp.constants.ts';

// Not env.ts: it reads import.meta.env, which only exists in app code, and this
// runs in Node while Vite loads its config. Vite's own loaded env is used instead.
const supabaseOriginOf = (env: Record<string, string>) =>
  new URL(z.url().parse(env.VITE_SUPABASE_URL)).origin;

export function csp(): Plugin {
  let supabaseOrigin: string;

  return {
    name: CSP_PLUGIN_NAME,
    apply: CSP_COMMAND,
    config: () => ({ build: { assetsInlineLimit: 0 } }),
    configResolved(config) {
      supabaseOrigin = supabaseOriginOf(config.env);
    },
    transformIndexHtml: {
      // Post, so the policy is prepended after every other plugin's tags and
      // so precedes them.
      order: 'post',
      handler: () => {
        const directives = {
          ...CSP_DIRECTIVES,
          'connect-src': supabaseOrigin,
        };
        const content = Object.entries(directives)
          .map((directive) => directive.join(' '))
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
