# PAYMENT_WEBHOOKS Fix Plan

## Changes

- `public/js/paddle-pro.js` — tighten license restore to `txn_[A-Za-z0-9]+` length ≥ 12

## New files

- None (webhook handler deferred — requires backend)

## Verification goals

- [x] Random short strings no longer unlock Pro via restore box
- [x] Absence of webhook handlers documented (N/A infrastructure, MEDIUM residual entitlement risk)

## Manual verification (for the human)

- Pricing page: paste `abcdefgh` → reject
- Paste a real `txn_…` from a receipt → unlocks
- Confirm no webhook URL configured in Paddle that points at SPECTOR (none should)
