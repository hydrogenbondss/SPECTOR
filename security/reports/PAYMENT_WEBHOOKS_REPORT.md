# PAYMENT_WEBHOOKS Security Report

## Status: MEDIUM

## Findings

No Stripe/Paddle **webhook endpoints** in the repo. Checkout is Paddle.js overlay; `checkout.completed` sets `localStorage.spector_pro`.

### Fixed this audit

- `activateLicenseKey` now requires a `txn_…` shaped id (min length 12) instead of any 8+ character string.

### Residual (product-accepted)

- Pro remains honor-system / DevTools spoofable without server Transactions API validation.
- No webhook signature verification possible without a backend.
- Documented in `docs/PADDLE.md` / terms.

Severity MEDIUM (not CRITICAL) because financial settlement stays with Paddle MoR; impact is free Pro features (history/export), not card theft.

## What's at risk

Users unlock Pro without payment via DevTools or fabricated `txn_` strings.

## What's already secure

No card data touches SPECTOR. Paddle handles PCI.

## Recommendations

1. Optional future: server webhook + Transactions API to mint non-forgeable entitlement.
2. Until then, keep marketing honest about honor-system restore.
