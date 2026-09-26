import type { Plugin } from 'vite';
import {
  CSP_COMMAND,
  CSP_PLUGIN_NAME,
  CSP_TRANSFORM_INDEX_HTML,
} from './csp.constants.ts';

export const csp = (): Plugin => ({
  name: CSP_PLUGIN_NAME,
  apply: CSP_COMMAND,
  transformIndexHtml: CSP_TRANSFORM_INDEX_HTML,
});
