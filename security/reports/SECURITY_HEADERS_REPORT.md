# SECURITY_HEADERS Security Report

## Status: PASS

## Findings

`vercel.json` global `/(.*)` headers now include:

| Header | Status |
|--------|--------|
| Content-Security-Policy | Present (enforcing; allows `'unsafe-inline'` for inline scripts/styles) |
| Strict-Transport-Security | **Added** `max-age=31536000; includeSubDomains; preload` |
| X-Frame-Options | **Added** `SAMEORIGIN` (aligns with CSP `frame-ancestors 'self'`) |
| X-Content-Type-Options | Present `nosniff` |
| Referrer-Policy | Present `strict-origin-when-cross-origin` |

### Residual

CSP `'unsafe-inline'` weakens XSS containment — required today for large inline scripts. Migrating to nonces is a larger refactor (tracked as LOW residual).

## What's at risk

Before fix: missing HSTS allowed HTTPS stripping on first visit; missing XFO relied only on CSP frame-ancestors.

## What's already secure

CSP allowlists only Paddle, Formspree, GitHub API, Google Fonts.

## Recommendations

1. Deploy `vercel.json` header changes to production.
2. Longer-term: CSP nonces / externalize scripts to drop `'unsafe-inline'`.
