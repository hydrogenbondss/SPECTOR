# AUTH_MIDDLEWARE Fix Plan

## Changes

- None — no protected server routes exist.

## Verification goals

- [x] Enumerated every static route; none require server auth
- [x] Confirmed no API handlers return user records

## Manual verification (for the human)

- Spot-check production: `curl -I https://www.spectorlabs.io/beta/test` returns HTML without Set-Cookie auth
