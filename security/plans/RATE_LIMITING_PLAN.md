# RATE_LIMITING Fix Plan

## Changes

- `public/index.html` — beta submit cooldown + `#beta-status` element

## Verification goals

- [x] Rapid double-submit blocked client-side for 60s
- [x] No auth endpoints requiring 10/15min limiter (none exist)

## Manual verification (for the human)

- Submit beta form once (or trigger cooldown path), immediately submit again — expect wait message
- Confirm Formspree project spam protection settings
