import type { IndexHtmlTransform } from 'vite';

export const CSP_PLUGIN_NAME = 'csp';

export const CSP_COMMAND = 'build';

const CSP_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' https://fonts.googleapis.com",
  'font-src https://fonts.gstatic.com',
  'connect-src %VITE_SUPABASE_URL%',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

export const CSP_TRANSFORM_INDEX_HTML = {
  // Pre, so Vite's env replacement runs after it and fills in
  // %VITE_SUPABASE_URL%.
  order: 'pre',
  handler: () => [
    {
      tag: 'meta',
      attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP_POLICY },
    },
  ],
} satisfies IndexHtmlTransform;
