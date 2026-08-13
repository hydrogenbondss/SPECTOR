# FRONTEND_SECRETS Fix Plan

## Changes

- None required (publishable tokens only).

## Verification goals

- [x] No secret keys in frontend
- [x] Only publishable Paddle/Formspree identifiers client-side

## Manual verification (for the human)

- In Paddle dashboard, confirm only client-side token is used on the site (no API key embedded)
