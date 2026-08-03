# AGENTS.md

## Cursor Cloud specific instructions

Spector is a **zero-runtime-dependency static PWA** (vanilla JS/HTML/CSS). The
entire app lives in `public/`; all app logic is inline in `public/index.html`,
`public/app.html`, and `public/say.html` (`SpectorCore`/`SayCore` are exposed on
`window`). Node is only used for the CSS build and the link-check lint; Python
runs the dev server and the verifier; Chrome is used by the headless test paths.

### Accessibility (frontend)

When changing HTML/CSS/JS UI in `public/`, follow strictly the accessibility
rules in [A11Y.md](https://github.com/fecarrico/A11Y.md/blob/main/docs/en/A11Y.md)
(WCAG 2.2-aligned agent contract; lazy-load only the reference guides needed).

- **Compliance profile:** Launchpad (A floor for structure/semantics; do not
  regress keyboard, labels, focus, or live regions). Prefer Standard (AA) when
  the change is small and cheap.
- **Stack constraint:** vanilla HTML — use native controls (`button`, `a`,
  `label`/`for`, `dialog` patterns) before ARIA. No clickable `div`s for
  primary actions.
- **Brand override:** Spector ink/teal tokens and dark player stage win over
  generic “tint gray / avoid pure black” design-linter advice when they
  conflict. Contrast still must meet the profile.

### Services

There is a single service: the static site served from `public/`.

- **Run (dev):** `python3 -m http.server 8000 --bind 127.0.0.1 --directory public`
  then open `http://127.0.0.1:8000/index.html` (player at `/app.html`). There is
  no hot reload — it serves files as-is, so just refresh the browser after edits.
- **Rewrites:** production/pretty URLs (e.g. `/say`, `/pricing`) come from
  `vercel.json` rewrites. Plain `http.server` does NOT apply them (use the full
  `.html` path). To exercise the rewrites locally, run
  `python3 scripts/preview_server.py` (serves `public/` on port 8765 with the
  `vercel.json` routes applied).
- **Build:** `npm run build` regenerates `public/style.min.css` and
  `public/landing-v2.min.css` via `clean-css-cli`. These minified files ARE
  committed; run the build after editing `style.css`/`landing-v2.css` and commit
  the regenerated `.min.css`. The site loads fine without a build for local dev.

### Lint / test

- **Lint (internal links):** `node scripts/check_internal_links.mjs` — checks all
  `<a href>` targets and fragment ids across the HTML files.
- **Verifier (full gate):** `python3 tests/run_verification.py` — must print
  `ALL VERIFICATION STEPS PASS`. It spins up its own `http.server` on port 8088,
  runs static/structure checks, the in-browser `SpectorCore` test harness, and a
  service-worker offline probe. It finds Chrome automatically via `google-chrome`
  on PATH and writes all artifacts to `/tmp/spector-verify` (never into the repo).
- **Core engine tests only:** open `http://127.0.0.1:<port>/app.html?test` in a
  browser (or headless Chrome `--dump-dom`) and read the `SpectorTest` output
  (`allPass` must be true).
- **Deeper QA gate** (Lighthouse, visual screenshots): see
  `.claude/skills/preflight/SKILL.md`.

### Gotchas

- Player debug scaffolding (temple-button sim, tilt sliders) is behind
  `app.html?debug`; the core test harness is behind `app.html?test`. Neither is
  visible to normal users.
- Comfort mode uses device-orientation motion; on desktop it is inert unless you
  simulate orientation (DevTools > Sensors) — this is expected, not a bug.
