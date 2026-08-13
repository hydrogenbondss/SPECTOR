# CSRF Fix Plan

## Changes

- Client-side beta submit cooldown (see RATE_LIMITING) as abuse friction

## Verification goals

- [x] No SPECTOR session cookies
- [x] Documented Formspree as third-party CSRF boundary

## Manual verification (for the human)

- Confirm browser Application → Cookies for spectorlabs.io has no app session cookies after browsing
