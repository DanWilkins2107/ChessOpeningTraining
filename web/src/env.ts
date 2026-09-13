// Not zod: parsing an object schema probes for eval support with
// `new Function`, which the CSP reports as a violation.
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!URL.canParse(supabaseUrl)) {
  throw new Error('VITE_SUPABASE_URL is not a URL');
}

if (!supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_ANON_KEY is empty');
}

export const env = {
  VITE_SUPABASE_URL: supabaseUrl,
  VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
};
