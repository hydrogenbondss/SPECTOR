# SSRF Security Report

## Status: PASS

## Findings

No server-side URL fetching. Browser fetches are fixed allowlist destinations:

- Formspree form action (hardcoded)
- `api.github.com/repos/hydrogenbondss/SPECTOR` (hardcoded)
- `/beta/testers-registry.json` (same-origin)
- Service worker `fetch` of same-origin navigations/assets only

No link-preview, import-from-URL, or webhook-tester features.

## What's at risk

N/A for classic SSRF (no server that can be coerced to hit internal IPs).

## What's already secure

No user-supplied URL is passed to a server fetch.

## Recommendations

If adding import-from-URL later, validate scheme + block private IP ranges server-side.
