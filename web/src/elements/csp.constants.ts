// Excluded from Stryker in stryker.config.json. csp.integration.test.ts checks
// what the built app blocks rather than these strings, so a stricter policy, or
// one applied in dev too, would survive.

export const CSP_PLUGIN_NAME = 'csp';

export const CSP_COMMAND = 'build';

export const CSP_DIRECTIVES = {
  'default-src': "'self'",
  'script-src': "'self'",
  'style-src': "'self' https://fonts.googleapis.com",
  'font-src': 'https://fonts.gstatic.com',
  'object-src': "'none'",
  'base-uri': "'self'",
  'form-action': "'self'",
};
