# RATE_LIMITING Security Report

## Status: LOW

## Findings

No login/registration/password-reset endpoints. Sensitive client POSTs:

- Hardware beta → Formspree (third-party rate limits)
- No SPECTOR server rate limiter (no server)

### Fixed this audit

- Client-side 60s cooldown on beta form via `localStorage` key `spector_beta_submit_at` + `#beta-status` message.
- Bypassable by clearing storage / other browsers — friction only.

## What's at risk

Form spam to Formspree / hello@ mailto fallback. Not auth brute-force (no passwords).

## What's already secure

No password endpoints to hammer.

## Recommendations

1. Rely on Formspree dashboard spam controls.
2. Add server rate limits if a custom backend form is introduced.
