# SECRETS_EXPOSURE Security Report

## Status: PASS

## Findings

- No `.env` or `.env.*` files exist in the working tree or git index (`git ls-files .env` empty).
- No matches for `sk_live_`, `sk_test_`, `AKIA…`, `ghp_`, `github_pat_`, or PEM private keys in product source (excluding checklist / watch skill docs).
- No `NEXT_PUBLIC_*`, `VITE_*`, or `REACT_APP_*` runtime env vars in the product.
- Publishable identifiers ship in frontend by design:
  - `public/js/paddle-pro.js` — Paddle client token `live_…` and price id `pri_…` (documented safe client-side tokens in `docs/PADDLE.md`).
  - `public/index.html` — Formspree form id `mzdlddkp` (public form endpoint).
- `.claude/skills/watch/` references Whisper API keys loaded from `~/.config/watch/.env` — local agent tooling, not the shipped site; keys are not committed.
- `private/` holds operator PII and is gitignored; not tracked.

### Gaps found (fixed this pass)

- `.gitignore` did not ignore `.env` / `.env.*`.
- No `.env.example` documenting the (empty) secret surface.

## What's at risk

Without `.env` ignore rules, a future backend secret could be accidentally committed. No live secret exposure found in the current tree.

## What's already secure

- Static architecture avoids server secret storage.
- Paddle uses client-side tokens only; no Paddle secret API key in repo.
- `private/` gitignored for beta PII.

## Recommendations

1. Keep `.env` ignored; use `.env.example` placeholders only.
2. Never commit Paddle **API** keys or Formspree private keys if a backend is added.
3. Rotate any secret if it ever appears in git history (none found for product secrets).

## Verification results

- [x] `git ls-files .env` returns nothing
- [x] Secret pattern grep across source returns nothing (product paths)
- [x] No public-prefixed env vars hold secrets
- [x] `.env.example` exists with placeholders only
- [x] `.gitignore` includes `.env` / `.env.*` with `!.env.example`
