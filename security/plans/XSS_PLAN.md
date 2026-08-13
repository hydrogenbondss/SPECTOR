# XSS Fix Plan

## Changes

- `public/beta-test.html` — `escapeHtml` for checklist/steps
- `public/app.html`, `public/say.html` — safe `?test` DOM write via `textContent`

## Verification goals

- [x] No unsanitized user content into `innerHTML` for beta protocol rendering
- [x] Test harness does not concatenate JSON into HTML strings
- [x] Core `formatChunkHtml` continues to escape before markup

## Manual verification (for the human)

- Paste `<img src=x onerror=alert(1)>` into script → launch player → confirm literal text, no alert
- Open `app.html?test` — JSON pre renders; title SpectorTest
