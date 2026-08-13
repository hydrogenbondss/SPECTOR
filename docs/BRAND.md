# Spector — Brand Guidelines

The single source of truth for how Spector looks and sounds. These values are
the ones actually implemented in `public/style.css` (`:root` design tokens) and
across the landing + player — keep this doc and the CSS in lock-step.

> Spector sells **teleprompter software only**. Not smart glasses, not Meta
> hardware. Not affiliated with Meta Platforms, EssilorLuxottica, or Ray-Ban.

---

## 1. Name & wordmark

- **Name:** **Spector** — plain title case, everywhere in prose (site copy,
  README, docs, emails, posts). No ™, ever — it reads as legal pretension the
  voice doesn't want. ALL-CAPS `SPECTOR` is reserved for graphic lockups: the
  letterspaced nav wordmark and the homepage hero kicker (not prose spelling).
  The repo name `SPECTOR` stays as-is and reads as that same lockup.
- **Headline hierarchy:** visible homepage H1 is **"Stop reading. Start
  delivering."** Supporting subhead: SPECTOR turns your script into a natural
  speaking pace, so you can keep your eyes up and stay present. Punctuation-aware
  pacing remains a core product claim and supporting message (demo label,
  meta/OG: **"Your punctuation sets the pace — not your voice."**). **"Eyes
  Forward"** is earned equity only (badge / secondary), never the primary share
  title. Retired as visible H1: "Your punctuation sets the pace — not your
  voice."; "The teleprompter that reads your punctuation."
- **One-liner (supporting / meta):** *Your punctuation sets the pace — not your
  voice. No mic. No listening. Rehearse on phone, perform eyes-up on smart
  glasses.*
- **Two distinct lines — do not paraphrase either:**
  - **Pairing / footer tagline** (contrarian association): **"Punctuation-paced.
    No mic. No cloud."** — site footers, trust rows, OG titles.
  - **Permanent promise** (state verbatim — README, landing footer strip, FAQ):
    **"Free core, forever. No account, no cloud, nothing uploaded — ever."**
- Always write **Spector**, never "the Spector app" or "Spector Labs product."
  Footer entity line: `© Spector Labs`.
- **Primary try CTA:** label **"Try Spector free"** → opens the player with a
  sample (`app.html?script=…`). `#try` remains for paste / Try with this script /
  Save.
- **Homepage IA (structural):** first viewport = one full-bleed dark plane —
  brand + H1 + one supporting sentence + one CTA + live HTML product demo
  (`#hero-demo`; click opens the player with a sample; pause control for
  WCAG 2.2.2). Light canvas begins below. Then: one proof section (three copy
  beats — punctuation-paced / no microphone / screen first) → collapsed Try
  (sample CTA; paste/save behind disclosure) → compact devices → pricing teaser
  → 3 FAQs → hardware beta (invite-capped; does not replace Buy Pro) → quiet
  founder line. No invented testimonials. No feature-row essays, no changelog
  wall, no investor block on the home page.
- **Pricing page:** short hero (free / $34 once) + quiet ledger + embedded
  Paddle checkout + trimmed billing FAQ. Pro sells longer on-device history
  (50 vs 5) and export — not sync until it ships. Same light canvas / ink CTAs
  as home.

---

## 2. Color

Light-first marketing site. Cool near-white canvas, ink text, ink/white CTAs.
One muted teal accent — live pip, focus rings, pacing highlights, inline links.
No purple. No glow. No cream/terracotta palette.

The player (`body.glasses` / `app.html`) keeps a **dark reading stage** for
legibility, but shares the same accent family, type, and CTA grammar.

### Core tokens (`:root` — marketing)

| Token | Hex / value | Use |
|-------|-------------|-----|
| `--bg` | `#F7F7F8` | Page background |
| `--bg-elevated` / `--panel` | `#FFFFFF` | Cards, panels, elevated surfaces |
| `--text` / `--t1` | `#0A0A0C` | Primary text (ink) |
| `--text-muted` / `--t2` | `#3D3D45` | Secondary copy |
| `--text-dim` / `--t3`–`--t4` | `#6B6B76` / `#8E8E99` | Labels, kickers, metadata |
| `--cta-bg` | `#0A0A0C` | Primary buttons / nav CTA (ink) |
| `--cta-bg-hover` | `#1C1C1F` | CTA hover |
| `--cta-text` | `#FFFFFF` | White on ink CTAs |
| `--accent` | `#0E7C74` | Links, focus rings, live pip — **not** CTAs |
| `--accent-text` | `#0E7C74` | Link tint / soft emphasis |
| `--accent-subtle` / `--accent-surface` | `color-mix(in oklch, …)` | Hover fills (perceptual ramp) |
| `--hair1`–`--hair3` | ink alpha 5% / 8% / 14% | Hairline borders |
| `--machined` | inset hairline stack | Panel edge treatment |

### Player stage (`body.glasses`)

| Token | Hex / value | Use |
|-------|-------------|-----|
| `--bg` | `#0A0A0C` | Reading canvas |
| `--text` | `#F7F8F8` | Active teleprompter line |
| `--cta-bg` / `--cta-text` | `#FFFFFF` / `#0A0A0C` | Chrome controls (white/ink) |
| `--accent` | `#2A9B90` | Live/focus on dark stage |
| `--accent-text` | `#5EC4B8` | Soft emphasis on dark |

### Rules

- **One accent only.** Muted teal (`#0E7C74` light / `#2A9B90` player). Not a
  second brand color; lighter tints are the same hue.
- **CTAs are ink/white**, never teal fills. Teal's jobs: live indicator,
  inline links, focus rings, small pacing highlights.
- The **active reading line** in the player is white (`--text` on the dark
  stage) for maximum legibility.
- Never introduce purple, indigo→violet gradients, glass blur, or warm cream /
  terracotta “AI cozy” palettes. If you see them, it's a bug.

---

## 3. Typography

- **Body + display:** [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans)
  only — one deliberate grotesque for both prose and H1/H2. Never Inter /
  Roboto / system-default as the loaded webfont (reads as vibe-coded SaaS).
  System fallback: `system-ui, -apple-system, sans-serif`. Display weights
  **400–500**, tight tracking (`-0.02em` to `-0.03em`). Use
  `text-wrap: balance` on headings.
- **Kickers / metadata:** Instrument Sans, small, muted — not mono “terminal”
  label spam. Reserve `--font-mono` for true code/tabular needs (player numbers).
- **Teleprompter chunk:** `--chunk-size: 31px`, `--chunk-leading: 1.55`
  (user-adjustable 22–42px / 1.3–2.0 in the player).
- Numbers in the player (timer, stats) use `font-variant-numeric: tabular-nums`.

---

## 4. Shape, depth & motion

- **Radii:** `--radius: 8px`, `--radius-lg: 12px`. No pill CTAs (`9999px`).
- **Surfaces:** hairline borders + soft black-alpha shadows. **No glass blur**
  on nav or panels.
- **Easing:** short settles (0.12–0.2s). Prefer transform/opacity; respect
  `prefers-reduced-motion`.
- **View transitions:** cross-document `@view-transition { navigation: auto }`
  with the nav wordmark as a shared `view-transition-name` (self-gates where
  unsupported).
- Motion is meaningful, not decorative: scroll reveals on the landing; Comfort
  mode spatial anchoring in the player.

---

## 5. Feel & voice

- **Feel:** sharp modern SaaS craft (Resend / Linear restraint) — light
  marketing, ink-first CTAs, calm hierarchy. Not a purple-dark clone. Not
  vibe-coded (no purple glow, Inter, pill badge grids, glassmorphism).
- **Voice:** direct, second-person, short sentences. Lead with the benefit
  ("Eyes up, no script-face"), not the mechanism.
- **Homepage job:** explain the product in the hero (H1 + one sentence); put
  Try close behind. Demote founder note — late, quiet, not early equity.
- **Haptics + audio:** subtle vibration and a soft click on interaction — keep
  them understated.

---

## 6. Assets

- **Logo mark:** `public/images/logo-mark.png` (nav) · app icon
  `public/images/app-icon.png` · favicon `public/favicon.ico`.
- **Homepage visuals:** hero = live HTML product demo (`#hero-demo` in
  `public/index.html`). `public/images/launch.mp4` is present and tracked but
  is **not** the current homepage hero. Current proof section is copy-only;
  `public/images/proof-glasses.webp` remains an available asset (mirrored phone
  FOV for XREAL / Viture — not Ray-Ban Meta Display) but is not shown in the
  current homepage proof block.
- **PWA icons:** defined in `public/manifest.json`.
- **Social/OG card:** `public/images/og-card.png` (1200×630).
- **Theme color:** `#F7F7F8` marketing / `#0A0A0C` player
  (`<meta name="theme-color">`).

---

*Derived from `public/style.css`. When you change a token there, update this
file in the same commit.*
