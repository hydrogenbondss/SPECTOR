# SECRETS_EXPOSURE Fix Plan

## Changes

- `.gitignore` — ignore `.env`, `.env.*`, keep `!.env.example`
- `.env.example` — create with commented placeholders and note that the static site has no runtime secrets

## New files

- `.env.example`

## Verification goals

After implementation, ALL of these must be true:

- [x] `git ls-files .env` returns nothing
- [x] `grep`/rg for secret patterns across product source returns nothing
- [x] No env var prefixed with NEXT_PUBLIC_, VITE_, or REACT_APP_ contains a secret key
- [x] `.env.example` exists with placeholder values only

## Manual verification (for the human)

- Confirm Vercel project env vars (if any) contain no accidental secret dumps into build logs
- Confirm `private/` never appears in `git status` as untracked-to-add without check-ignore
