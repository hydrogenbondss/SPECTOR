# ACCESS_CONTROL Security Report

## Status: MEDIUM

## Findings

No server-side resource ownership model. Closest analogue: **private beta tester IDs**.

- `public/beta/testers-registry.json` is world-readable.
- `beta-test.html` loads `?tester=SB-…` and activates any matching row (no ownership proof).
- IDs are sequential (`SB-YYYYMMDD-NNN`) and documented as shared secrets (`docs/BETA_TESTING.md`).
- Anyone with a guessed ID can view device label/status/protocol and submit feedback **as** that ID (localStorage + mailto).

### Fixed this audit

- Removed `country` from the public registry (was Italy for SB-20260812-001) — reduces public PII surface.
- Registry note now states IDs are shared secrets, not strong auth.

### Residual (accepted without backend)

- Guessable tester IDs remain.
- No cryptographic invite tokens.

## What's at risk

Enumerator discovers active tester IDs → spoofs feedback attribution; learns device family/status. Does **not** expose emails/names (those stay in gitignored `private/`).

## What's already secure

- No names/emails in public registry.
- Official CSV status remains operator-controlled offline.
- No admin dashboard.

## Recommendations

1. Prefer non-guessable random IDs for **future** testers (do not renumber Mirko mid-invite).
2. Treat registry contents as public; keep PII only in `private/`.
3. Backend auth required before claiming strong access control.
