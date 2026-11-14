# Starter issues — good first contributions

Candidate good-first-issues for public launch. The owner creates these on
GitHub manually; this file is the source of truth for their content. Each is
self-contained, respects the zero-dependency constraint (spikes may conclude
"not worth a dependency" — that is a fine outcome), and points at the right
part of the codebase.

---

## 1. Spike: `.docx` import

**Labels:** `enhancement`, `editor`, `spike`

The editor imports `.txt` and `.md` today (`initFileUpload` in
`public/index.html`, parsing via `SpectorCore.markdownToScript` in
`public/spector-core.js`). Speakers often keep speeches in Word.

**Question:** can we extract document text (paragraphs, headings → `##`,
bold → `**emphasis**`) without a heavy dependency? Options to evaluate:
`mammoth.js` (browser build size), serverless pre-conversion, or "export to
.md from Word" documentation instead.

**Acceptance:** a written spike result in the issue (size/bundle cost,
fidelity sample against a real .docx, recommendation). Code only if the
recommendation is to ship it.

## 2. Additional cue syntax

**Labels:** `enhancement`, `core`

Spector cues today: `**emphasis**`, `[pause]`, `[pause:Ns]`, `## Section`
(parsed in `public/spector-core.js`; rendered by `formatChunkHtml`;
timed by `cuePauseMs`/`computeMs`).

**Idea:** one or two new cues — community favorites so far: `[slow] …`
(deliberate slowed stretch), `[breathe]` (a beat, shorter than `[pause]`),
or `[emphasis:soft]`.

**Acceptance:** new cue works end-to-end (chunk → timing → render → editor
cue toolbar button), adds assertions to the `app.html?test` harness, and is
documented in the editor's format-help line. Keep `countSpokenWords`
correct for it.

## 3. Comfort-mode tuning feedback thread → data

**Labels:** `feedback`, `player`

Comfort mode's Kalman filter constants and breathing/drift amplitudes are
hand-tuned guesses (`public/app.html`, `setupSpatialAnchoring`,
`startDualSineBreathing`, `startGentleDriftWithRotation`).

**Task:** try Comfort mode on a real phone/glasses across a few days and
report what feels off (lag, seasickness, too-subtle drift, overshoot).
Turn the best findings into concrete constant adjustments or a small
"Comfort sensitivity" slider in the customize panel.

**Acceptance:** either a PR with tuning changes + before/after description,
or a detailed issue comment with device + symptoms + suggested directions.

## 4. /say word-prediction research

**Labels:** `research`, `say`

`/say` (`public/say.html`) is an early switch-scan AAC composer. Scanning
letter-by-letter is slow; next-word prediction is the standard accelerator
but a full language model is out of the question for a zero-dependency
static site.

**Question:** what is the cheapest viable prediction? Ideas: a small
bundled frequency list (top-N words), context-free bigram tables, or an
optional user-supplied wordlist in localStorage.

**Acceptance:** research comment comparing approaches on size, privacy
(everything on-device), and hit-rate on sample AAC phrases; prototype only
if it stays dependency-free and offline.

## 5. UI translation / i18n

**Labels:** `enhancement`, `i18n`

All UI copy is English hardcoded in `public/index.html`, `public/app.html`,
and `public/say.html`.

**Task:** design a minimal i18n approach for a static site with no build
step (e.g. `data-i18n` attributes + a JSON dictionary per language, loaded
by `spector-core.js`-style plain script), then land ONE complete target
language (suggest: the contributor's native language) as proof.

**Acceptance:** language picker persists across sessions, switching
languages requires no rebuild, offline still works (dictionary in the SW
cache), and the player/player-a11y strings are covered — not just landing.
