import type { Plugin } from 'vite';
import { z } from 'zod';
import { CSP_PLUGIN_NAME } from './constants.ts';

export function csp(): Plugin {
  let supabaseOrigin: string;

  return {
    name: CSP_PLUGIN_NAME,
    apply: 'build',
    config: () => ({ build: { assetsInlineLimit: 0 } }),
    configResolved(config) {
      supabaseOrigin = new URL(z.url().parse(config.env.VITE_SUPABASE_URL))
        .origin;
    },
    transformIndexHtml: {
      // Post, so the policy is prepended after every other plugin's tags and
      // so precedes them.
      order: 'post',
      handler: () => {
        const directives = {
          'default-src': "'self'",
          'script-src': "'self'",
          'connect-src': supabaseOrigin,
          'style-src': "'self' https://fonts.googleapis.com",
          'font-src': 'https://fonts.gstatic.com',
          'object-src': "'none'",
          'base-uri': "'self'",
          'form-action': "'self'",
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
