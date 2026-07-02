---
name: preflight
description: Run Spector's full QA gate before any push — verifier, in-browser test harness, Lighthouse (desktop + mobile, 90+ required), CSS sanity, and visual screenshots of the hero and player. Use before committing changes to public/, and always before merging to main.
---

# Spector preflight — the QA gate

Run every step. **Do not push if any gate fails.** Report results as a short
pass/fail table with the Lighthouse numbers.

## Environment (Claude Code cloud sandbox)

- Chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (if missing, `find /opt/pw-browsers -name chrome -type f`)
- Lighthouse: `npx -y lighthouse` with `export CHROME_PATH=<chromium path>`
- Serve the site with `python3 -m http.server <port> --bind 127.0.0.1 --directory public` (pick a fresh port per step; kill the server after)

## Gates

### 1. Static verifier
```bash
timeout 60 python3 tests/run_verification.py 2>&1 | tail -1
```
Must print `ALL VERIFICATION STEPS PASS`. It writes artifacts to `/tmp/spector-verify`
(never into the repo — if untracked junk appears in the repo after a run, that's a
regression in the verifier itself).

### 2. Core engine tests (`?test` harness)
```bash
DOM=$("$CHROME" --headless --no-sandbox --disable-gpu --virtual-time-budget=6000 \
  --dump-dom "http://127.0.0.1:<port>/app.html?test" 2>/dev/null)
echo "$DOM" | grep -o '"allPass": *[a-z]*'      # must be true
echo "$DOM" | grep -c '"pass": *false'           # must be 0
```
Baseline is 32 assertions; if you added engine behavior, add an assertion for it.

### 3. Lighthouse — both profiles, 90+ everywhere
```bash
npx -y lighthouse http://127.0.0.1:<port>/index.html \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless --no-sandbox --disable-gpu" \
  [--preset=desktop] --quiet --output=json --output-path=<file>
```
Run once with `--preset=desktop`, once without (mobile). **Hard floor 90 on all
four categories; expected baseline is desktop ≈100 perf / 95+ a11y, mobile ≈99 perf.**
If a11y drops, print failing audits:
```bash
node -e "const r=require('<file>');r.categories.accessibility.auditRefs.map(a=>a.id).forEach(id=>{const a=r.audits[id];if(a&&a.score!==null&&a.score<1&&a.scoreDisplayMode==='binary')console.log(id,'-',a.title);})"
```
Known traps (all hit before):
- **Contrast is computed against the real canvas** — the bg is `#0A0A0C`, not `#000`. `--text-dim` must stay ≥4.5:1 on it (currently `#85858E`).
- A TBT spike of ~400ms is usually sandbox CPU contention — re-run once before believing it.
- Anything fetched on load (fonts, APIs) must be non-blocking (`media=print/onload` for CSS, `requestIdleCallback` for JS fetches).
- New media needs `preload="none"` + explicit width/height + poster.
- Don't put incomplete ARIA roles on divs (role="table" without role="cell" fails `aria-required-children`); an `aria-label` must contain the element's visible text.

### 4. CSS sanity
```bash
o=$(grep -o '{' public/style.css | wc -l); c=$(grep -o '}' public/style.css | wc -l)
```
Counts must match. Also grep that player selectors still exist (`#script-container`,
`.mode-btn`, `.speed-presets`) — a 911-line CSS deletion shipped to production once.

### 5. Visual screenshots (eyeball before ship)
Landing sections use `.reveal` (opacity 0 until scrolled) and plain `--screenshot`
races animations. Use CDP: start Chromium with
`--headless=new --remote-debugging-port=<p> ... about:blank`, connect a small Node
script via `ws` to `http://127.0.0.1:<p>/json`, then:
`Page.navigate` → real `setTimeout` wait (~2.5s) → `Runtime.evaluate` to
`document.querySelectorAll('.reveal').forEach(e=>e.classList.add('revealed'))` and
`scrollIntoView` the target section → `Page.captureScreenshot`.
Capture at minimum: the hero (with live demo card) and `app.html` first-run
(sample script must be loaded, no debug scaffolding visible without `?debug`).
View the PNGs — don't just check file sizes; a dark page compresses small and a
5KB "success" can be a black frame.

## Report format

| Gate | Result |
|---|---|
| Verifier | PASS/FAIL |
| ?test harness | 32/32 |
| Lighthouse desktop | perf/a11y/bp/seo |
| Lighthouse mobile | perf/a11y/bp/seo |
| CSS braces | n/n |
| Screenshots | hero ✓ player ✓ |
