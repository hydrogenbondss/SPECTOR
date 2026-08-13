# FRONTEND_SECRETS Security Report

## Status: PASS

## Findings

Client-side identifiers present:

| Value | File | Classification |
|-------|------|----------------|
| Paddle `live_…` client token | `public/js/paddle-pro.js` | Publishable client token (safe per Paddle docs) |
| Paddle `pri_…` price id | same | Public catalog id |
| Formspree `mzdlddkp` | `public/index.html` | Public form endpoint |
| GitHub API (unauthenticated) | `public/index.html` | Public repo metadata |

No secret API keys, webhook secrets, or `NEXT_PUBLIC_*` secret misuse.

## What's at risk

Abuse of public Formspree form (spam) — mitigated partially by client rate limit + Formspree limits.

## What's already secure

Architecture keeps secret keys off the client. Documented in `docs/PADDLE.md`.

## Recommendations

Keep Paddle **API** keys and Formspree private keys out of `public/` if a backend is added.
