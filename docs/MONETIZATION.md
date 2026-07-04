# Spector — Monetization

> **STATUS: IN PROGRESS (July 2026) — Paddle account verification underway.**
> - **Paddle** is the chosen provider, replacing the earlier Lemon
>   Squeezy/Gumroad options below — it's also a Merchant of Record (handles
>   global VAT/tax and payouts without requiring a registered HK business),
>   which was the exact blocker documented below for Lemon Squeezy.
> - `public/pricing.html`, `public/terms.html`, `public/privacy.html`, and
>   `public/refund.html` now exist and are linked from the site footer —
>   Paddle's verification flow requires these to exist and be linked before
>   approving an account. Refund policy: 14 days, no questions asked.
> - **First domain review came back rejected** — Paddle categorized
>   spectorlabs.io as "Other/Donations" because the site framed the paid
>   tier as "become a founding supporter" / "back the build," with a
>   secondary "Sponsor instead" button right next to it. That reads as
>   charitable giving, not a software purchase, and falls outside Paddle's
>   Acceptable Use Policy. **Fix applied:** renamed the tier to plain
>   "Spector Pro" everywhere (site copy, pricing page, terms, refund,
>   privacy), removed the Sponsor button entirely, and led every mention
>   with what you get, not why you're giving money. Lesson for future
>   copy: a Paddle-reviewed domain needs to read unambiguously as "buy this
>   product for these features," not "support/sponsor/back this project."
>   Re-submit once this is live on main.
> - Product framing: **"Spector Pro"**, one-time $34 (see the pricing
>   rationale below). "Founding Supporter" as a label is retired — it read
>   as a donation ask to Paddle's reviewer.
> - Once Paddle approves the account and a product/price is created, wire
>   the real checkout link into `public/index.html`'s `go-pro-btn` (see
>   "Switch it on" below — same idea, different provider).
>
> Earlier options, kept for reference:
> - **Lemon Squeezy** — activation runs a Stripe-backed identity check that
>   requires a registered business (legal name matching a tax ID) in some
>   jurisdictions. This is what pushed the decision to Paddle instead.
> - **Gumroad** — the bank-connect flow doesn't support every region; the
>   reliable fallback is **Settings → Payments → PayPal** payout.

How Spector makes money, and how to switch it on. The guiding rule: **the open-source
core stays free forever**; money comes from *hosted / account value* layered on top
(sync, history, support), never from gating the code itself.

> You do **not** need Meta, an app store, or a backend to get paid. Spector is a web
> app — you sell through a normal web checkout that pays out to your bank.

---

## How the money reaches you

1. A visitor clicks **Buy Spector Pro** on the landing (`#support`).
2. They land on a checkout hosted by your payment provider (Paddle).
3. The provider charges the card and **deposits the money in your bank** on a payout schedule, minus their fee (~5% + processing).
4. The provider emails the buyer a **license key**.
5. They paste the key into the "Activate Pro" box; the app stores it and flips Pro on (localStorage).

No server of yours is required for the MVP. When you outgrow it, add a thin backend to validate keys server-side.

---

## Switch it on (≈30 minutes)

The buttons are already wired and ship in a safe "coming soon" state until you add URLs.

1. **Create a seller account.** **[Paddle](https://www.paddle.com/)** — it's a *merchant of record*, so it handles global VAT/sales tax and payouts for you without requiring your own registered business.
2. Create a product: **"Spector Pro"**, one-time, **$34**. Enable **license keys** if Paddle's catalog supports them for this product type.
3. In [`public/index.html`](public/index.html), set the constant near the top of the landing `<script>`:
   ```js
   const CHECKOUT_URL = 'https://YOURSTORE.paddle.com/checkout/XXXXXXXX';
   ```
4. Commit, push, deploy. Done — the "Buy Spector Pro" button now opens checkout, and pasted keys activate Pro.

### Optional: real key validation
The MVP accepts any well-formed key locally (see the `NOTE` in `initSupport()`). To actually enforce, validate before storing against Paddle's License/Subscription API (check Paddle's current docs for the exact endpoint and payload shape — it's changed provider, so don't reuse the old Lemon Squeezy example that used to live here). This is not piracy-proof — a determined user can bypass client-side checks — but that's an acceptable trade for a v1.

---

## Pricing

| Offer | Price | When |
|-------|-------|------|
| **Free core** | $0 | Now, forever — full teleprompter, Comfort mode, cues, analytics, PWA |
| **Spector Pro (lifetime)** | $34 one-time | Now — unlocks all current + future Pro features |
| **Pro subscription** | ~$6/mo or ~$48/yr | Later — once a real Pro feature + traffic exist |

Founding beta hardware testers get Pro free for life (already promised on the landing) — honor that; sell Spector Pro to everyone else.

**No donation/"pay what you want" option on spectorlabs.io.** Paddle's Acceptable
Use Policy doesn't cover donations, and having one next to the Pro purchase is
what got the domain's first review rejected (see the status note at the top).
If a pure-donation option is wanted later, it belongs on a surface Paddle
doesn't review — e.g. GitHub Sponsors linked only from the GitHub repo itself,
not from spectorlabs.io.

---

## Free vs Pro (proposed split)

Keep the free tier genuinely useful; Pro is *extras*, not a paywall on the basics.

- **Free:** paste/upload scripts, all player modes, Comfort spatial, cue markers, end-of-run analytics, local library (cap ~20), PWA/offline.
- **Pro (as it ships):** cloud sync across devices, unlimited saved scripts, rehearsal **history & pacing trends**, script + stats **export/share**, priority input on glasses features.

None of the Pro features are built yet — that's deliberate. Don't build the subscription backend until traffic shows people want it.

---

## Other revenue (secondary)

- **Glasses affiliate:** Ray-Ban Meta / XREAL / Viture referral links, clearly disclosed. Modest, fast to add, mild tension with the "not a retailer" line — keep it honest.
- **Niche B2B / creator wedge:** a "team" or "pro creator" tier sold to people who present for a living (realtors, sales, YouTubers, keynote coaches). Higher price, but it's outreach, not a button.
- **App-store founding developer:** when/if Meta opens its glasses app store, that's an extra channel (Meta would take ~30%). Future upside, not near-term cash.

---

## The honest bottleneck

Revenue is gated by **traffic**, not payment mechanics. A real demo video + posting it to smart-glasses and creator communities will do more than any pricing tweak. Set the money rail up once (it's cheap), then spend your effort on distribution.

---

*Config lives in `public/index.html` (`CHECKOUT_URL`, `SPONSOR_URL`). This doc and that code should move together.*
