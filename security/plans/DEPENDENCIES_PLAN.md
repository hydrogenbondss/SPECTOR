# DEPENDENCIES Fix Plan

## Changes

- `package.json` — pin `clean-css-cli` to `5.6.3`
- `package-lock.json` — refreshed via `npm audit fix` (brace-expansion ≥1.1.18)

## Verification goals

- [x] Lockfile committed / updated
- [x] Exact version pin (no `^`) for clean-css-cli
- [x] `npm audit` shows 0 vulnerabilities

## Manual verification (for the human)

- `npm ci && npm run build` succeeds locally
