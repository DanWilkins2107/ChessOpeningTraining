---
name: before-raising-a-pr
description: Load this skill before raising any PR. Carries this repo's PR evidence rule and the TODO comment format.
---

# Before raising a PR

## PR evidence

Applies only to PRs that touch web app code. Skip it for CLI, CI, DB and
docs-only PRs.

Capture every changed view at desktop 1280px and mobile 375px, plus a screen
recording for any multi-step flow. Capture ad-hoc; commit nothing.

Capture and upload mechanics live in the `pr-evidence` plugin — use it. If it
is missing, say so on the PR rather than dropping the evidence.

## TODO comments

Every TODO must read:

```
TODO <8-hex AgentJira node id> <YYYY-MM-DD>: description
```

The date is an expiry, no more than 30 days out.
