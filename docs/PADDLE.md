# Paddle — reference notes

How Spector Pro checkout actually works, and the non-obvious gotchas hit
while setting it up. For future-me (or whoever touches this next), not a
step-by-step tutorial.

## Architecture

Static site, no backend, no server. Checkout is Paddle's own **overlay**
(`Paddle.Checkout.open(...)`), loaded via Paddle.js directly in
`public/index.html`. No webhook, no signing secret, nothing server-side.

- `PADDLE_CLIENT_TOKEN` / `PADDLE_PRICE_ID` — plain constants in
  `index.html`. Client-side tokens are **safe to hardcode** (unlike API
  keys) — they can only open checkouts and preview prices/transactions.
  See [developer.paddle.com/paddlejs/about/client-side-tokens](https://developer.paddle.com/paddlejs/about/client-side-tokens).
- The token's `test_`/`live_` prefix auto-selects sandbox vs live
  (`Paddle.Environment.set('sandbox')` only fires for `test_` tokens) — a
  sandbox token can never accidentally behave as if it were live.
- No backend to validate a purchase, so `checkout.completed` just sets
  `localStorage.spector_pro` directly (mirrors the existing manual
  license-key box). This means Pro status is **locally spoofable** via
  devtools — known, accepted, documented in the code. Doesn't expose
  anyone's data or cost money; just an honesty-based local flag. Real
  enforcement would mean adding a backend to validate license keys
  against Paddle's Transactions API — not planned, not needed yet.

## The one bug worth remembering

The Paddle.js script tag **must be `async`, never `defer`.** `defer`
scripts are part of what `DOMContentLoaded` waits for — if
`cdn.paddle.com` is ever slow, blocked (ad blocker), or unreachable, a
deferred script hangs the page's entire `init()` sequence indefinitely,
since this file deliberately uses `DOMContentLoaded` (not
`window.onload`) so init doesn't wait on external resources. `async` +
an `onload="initPaddle()"` hook fully decouples the SDK from the page's
init timeline. Caught this by testing the page with Paddle.js
unreachable — worth re-testing that scenario after any change to how
Paddle.js is loaded.

## Sandbox vs live: fully separate everything

Not two modes of one account — two entirely separate accounts:
- Sandbox: `sandbox-login.paddle.com` (signup), `sandbox-vendors.paddle.com` (dashboard)
- Live: `login.paddle.com` (signup), `vendors.paddle.com` (dashboard)

Same email/business details work for both, but sandbox is a **separate
signup**, not a mode toggle on the live account. Sandbox skips identity
verification entirely (instant); live doesn't.

Sandbox and live API keys / client-side tokens only work against their
own environment (`sandbox-mcp.paddle.com` vs `mcp.paddle.com` for the
Paddle MCP; `sandbox-api.paddle.com` vs `api.paddle.com` for the REST
API).

## "Hosted Checkouts" is a trap for this use case

The dashboard's Checkout → Hosted Checkouts feature looked like the
obvious tool, but on a live account it's gated: *"Hosted checkouts are
only available for customers with an app-to-web sales funnel, or for
embedding the checkout in a non-mobile app."* A plain website with a Buy
button doesn't qualify — requesting access isn't the move. The actual
answer for a static site is the **Paddle.js overlay** approach used
here (`Paddle.Checkout.open()`), which needs a client-side token, not a
Hosted Checkout link.

## Individuals don't need a registered business

Paddle explicitly supports selling as an individual/sole trader —
**business verification is skipped entirely** for individuals; only
**identity verification** applies (government ID + proof of address via
Sumsub, sometimes automatic). This is a real, meaningful difference from
some competitors (Lemon Squeezy required a registered business entity
with a matching tax ID before their onboarding would even activate).

## CSP / Permissions-Policy

`vercel.json`'s enforcing CSP needs (already in place):
- `script-src`: `https://cdn.paddle.com`
- `connect-src`: `https://api.paddle.com` and `https://sandbox-api.paddle.com`
- `frame-src`: `https://*.paddle.com` and `https://*.paddle.io`
- `Permissions-Policy`: `payment=(self)`, not `payment=()` — the overlay
  needs the Payment Request API for accelerated payment methods.

## Account-level fields, not product-level

Catalog → Products holds the actual catalog (multiple products can live
under one account). But **Company Legal Name / Product Website / Contact
Name** live in Account Settings and are **account-wide**, not tied to a
specific product. Company Legal Name **locks after signup** — the
dashboard field can't be edited directly; email `sellers@paddle.com`
with the correction and why.

## Current live product

- Product: Spector Pro (`pro_01kx8xxsc9d4baxhd3yrbtxdk8`)
- Price: $34 one-time (`pri_01kx8xyrewyg78qw3hvcf9edak`)
- Domain approval: spectorlabs.io — approved
