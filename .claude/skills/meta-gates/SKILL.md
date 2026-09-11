---
name: meta-gates
description: Load before adding or changing a gate in meta/. Carries the three-file shape every gate follows.
---

# Meta gates

A gate is a vitest test that asserts a rule about the repo itself rather than
about the app. Each gate is three files in `meta/`, named after the gate:

- `<gate>.ts` — all the logic. The pure rule, the file enumeration
  (`git ls-files -z src`, run from the repo root), and an exported function
  that returns the violations it found.
- `<gate>.test.ts` — a wrapper carrying one assertion:
  `expect(violations()).toEqual([])`.
- `<gate>.test.test.ts` — the unit tests, driving the pure rule with inline
  cases rather than the real repo.

A violation is a string naming the file and what is wrong with it, so a failing
gate reads as a fix list.
