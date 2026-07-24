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
- **Headline hierarchy:** lead with the falsifiable claim — **"The teleprompter
  that reads your punctuation."** is the hero H1. **"Eyes Forward"** is earned
  equity only (badge / secondary), never the primary share title.
- **One-liner:** *The teleprompter that reads your punctuation. No mic. No
  listening. Rehearse on phone, perform eyes-up on smart glasses.*
- **Two distinct lines — do not paraphrase either:**
  - **Pairing / footer tagline** (contrarian association): **"Punctuation-paced.
    No mic. No cloud."** — site footers, trust rows, OG titles.
  - **Permanent promise** (state verbatim — README, landing footer strip, FAQ):
    **"Free core, forever. No account, no cloud, nothing uploaded — ever."**
- Always write **Spector**, never "the Spector app" or "Spector Labs product."
  Footer entity line: `© Spector Labs`.
- **Primary try CTA:** label **"Try Spector free"** → `/#try` (live editor).
  Demo tile may deep-link to `app.html`.

---

## 2. Color

Dark-first. Near-black canvas, soft-white text, a single purple accent used
sparingly. White CTAs — purple is never the primary button fill.

### Core tokens (`:root`)

| Token | Hex / value | Use |
|-------|-------------|-----|
| `--bg` | `#0A0A0C` | Page background |
| `--bg-elevated` / `--panel` | `#101014` | Cards, panels, machined surfaces |
| `--text` / `--t1` | `#F7F8F8` | Primary text, active teleprompter line |
| `--text-muted` / `--t2` | `#D0D6E0` | Secondary copy |
| `--text-dim` / `--t3`–`--t4` | `#8A8F98` / `#787D86` | Labels, kickers, metadata (≥4.5:1 on `--bg`) |
| `--cta-bg` | `rgba(255,255,255,0.92)` | Primary buttons / nav CTA |
| `--cta-text` | `#0A0A0C` | Ink on white CTAs |
| `--accent` | `#7C3AED` | Links, focus rings, live pip — **not** CTAs |
| `--accent-text` | `#A78BFA` | Link tint / soft emphasis |
| `--accent-subtle` / `--accent-surface` | `color-mix(in oklch, …)` | Hover fills (perceptual ramp) |
| `--hair1`–`--hair3` | white alpha 5% / 8% / 15% | Hairline borders |
| `--machined` | inset hairline stack | Panel edge treatment |

### Rules

- **One accent only.** Purple (`#7C3AED`). Lighter `#A78BFA` is a tint of it —
  not a separate brand color.
- **CTAs are white/ink**, never purple fills. Purple's jobs: live indicator,
  inline links, focus rings.
- The **active reading line** in the player is white (`--text`) for maximum
  legibility.
- No light “inverse” full-bleed bands on the dark site — stay dark editorial.
- Never introduce warm/tan tones or indigo→violet gradients. If you see them,
  it's a bug.

---

## 3. Typography

- **Body:** [Inter](https://fonts.google.com/specimen/Inter) variable
  (`100–900`). System fallback: `system-ui, -apple-system, sans-serif`.
- **Display (H1/H2):** [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans)
  — a characterful grotesque paired with Inter so the site is not Inter-only.
  Weights **400–500**, tight tracking (`-0.02em` to `-0.03em`). Use
  `text-wrap: balance` on headings.
- **Kickers / metadata:** `ui-monospace` stack (`--font-mono`) — uppercase,
  tracked, dim color. Not purple eyebrows.
- **Teleprompter chunk:** `--chunk-size: 31px`, `--chunk-leading: 1.55`
  (user-adjustable 22–42px / 1.3–2.0 in the player).
- Numbers in the player (timer, stats) use `font-variant-numeric: tabular-nums`.

---

## 4. Shape, depth & motion

- **Radii:** `--radius: 8px`, `--radius-lg: 12px`. No pill CTAs (`9999px`).
- **Surfaces:** machined inset hairlines + black-alpha shadows. Glass only on
  the sticky nav blur — nowhere else.
- **Easing:** short settles (0.12–0.2s). Prefer transform/opacity; respect
  `prefers-reduced-motion`.
- **View transitions:** cross-document `@view-transition { navigation: auto }`
  with the nav wordmark as a shared `view-transition-name` (self-gates where
  unsupported).
- Motion is meaningful, not decorative: scroll reveals on the landing; Comfort
  mode spatial anchoring in the player.

---

## 5. Feel & voice

- **Feel:** premium, calm, editorial. Confident but honest — no vanity metrics,
  no fake screenshots. "Early, live, and open." Must not read as vibe-coded
  SaaS (no purple primary buttons, no pastel pill badges, no heavy Inter-only
  display).
- **Voice:** direct, second-person, short sentences. Lead with the benefit
  ("Eyes up, no script-face"), not the mechanism.
- **Haptics + audio:** subtle vibration and a soft click on interaction — keep
  them understated.

---

## 6. Assets

- **Logo mark:** `public/images/logo-mark.png` (nav) · app icon
  `public/images/app-icon.png` · favicon `public/favicon.ico`.
- **PWA icons:** defined in `public/manifest.json`.
- **Social/OG card:** `public/images/og-card.png` (1200×630).
- **Theme color:** `#000000` (`<meta name="theme-color">`).

---

*Derived from `public/style.css`. When you change a token there, update this
file in the same commit.*
