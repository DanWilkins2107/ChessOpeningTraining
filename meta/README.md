# Meta gates

A gate is a vitest test that asserts a rule about the repo itself rather than
about the app. Gates live in `meta/`, `web/meta/` and `supabase/meta/`, each
laid out the same way. Every gate is a folder `<gate>/` of three files named
after it:

- `<gate>.ts` — all the logic: the pure rule, the file enumeration, and the
  exported function(s) returning the violations found.
- `<gate>.meta.test.ts` — a wrapper with no logic of its own, asserting each
  of those functions comes back empty.
- `<gate>.test.ts` — the unit tests, driving the pure rule with inline
  cases rather than the real repo.

Each meta folder stands alone and never imports from another. Within one,
helpers used by more than one gate live in `shared/<name>/` and test-only
helpers in `tests-shared/`.

A violation is a string naming the file and what is wrong with it, so a failing
gate reads as a fix list.
