// The only files allowed to sit at the src root, and the only .tsx files that
// need no snapshot: app-wide singletons owned by no page or element.
export const SRC_EXCEPTIONS = [
  'env.ts',
  'main.tsx',
  'router.tsx',
  'supabase.ts',
];
