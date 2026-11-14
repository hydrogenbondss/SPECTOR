# SPECTOR META BRAIN

Strategic source of truth for future Spector work.
**Baseline:** `origin/main` post-2026-11-14 reconciliation branch — monetization
and site analytics **removed** (free + open source, MIT; no telemetry).
Earlier baseline notes referencing Spector Pro / Paddle / Vercel Analytics
described a state that was deliberately abandoned before public launch; the
only surviving record of it is `CHANGELOG.md` (historical, untouched).

Claim tags used below:

- **VERIFIED** — confirmed from code, committed docs, or git state this session
- **INFERRED** — reasonable conclusion from evidence; not a hard fact
- **UNKNOWN** — cannot be established from the repository alone

---

## 0. Current Baseline

| Item | Status |
|------|--------|
| Product shape | **VERIFIED:** static PWA in `public/`; no app server; Vercel hosts `public/` |
| Monetization | **VERIFIED:** none — free and open source (MIT); no checkout, no tiers, no accounts |
| Site analytics / telemetry | **VERIFIED:** none (Vercel Analytics removed 2026-11); only your-initiated third-party touches remain: Formspree forms, GitHub API read, Google Fonts |
| Brand surface (marketing) | **VERIFIED:** light canvas `#F7F7F8`, ink CTAs, teal accent `#0E7C74`, Instrument Sans |
| Player surface | **VERIFIED:** dark reading stage (`body.glasses`), shared accent family |
| Core location | **VERIFIED:** `public/spector-core.js` — pure logic shared by player + editor (extracted 2026-11) |

---

## 1. What Spector Is

**VERIFIED:** Spector is an open-source, punctuation-paced teleprompter PWA. Users paste (or load) a script; the engine chunks it and advances on a timer shaped by punctuation, mode, and speed — **not** by microphone / speech recognition.

**VERIFIED positioning (site H1):**
“Stop reading. Start delivering.”

**VERIFIED supporting / meta claim:**
“Your punctuation sets the pace — not your voice.”

**VERIFIED permanent promise:**
“Free and open source. No account, no cloud, nothing uploaded — ever.”

**VERIFIED pairing tagline:**
“Punctuation-paced. No mic. No cloud.”

**VERIFIED product job:** rehearse on phone/computer → perform eyes-up where a display can show the script (today: XREAL / Viture via mirror). Ray-Ban Meta path is phone rehearsal, not on-lens Spector.

**VERIFIED sister surface:** `/say` — switch-scan AAC composer, separate from the teleprompter but same privacy / static architecture.

**What Spector is not (VERIFIED in brand/legal/README):** not smart glasses hardware; not affiliated with Meta / Ray-Ban / XREAL / Viture; not a mic-listening coach; not a cloud SaaS with accounts; not ad-supported or tracking-supported.

---

## 2. Core Product Insight

**VERIFIED insight in product + marketing:** Pace should come from **how the script is written** (commas breathe, periods hold, emphasis holds longer), not from listening to the speaker. That removes mic permission, privacy anxiety, and “is it hearing me?” failure modes.

**INFERRED strongest differentiator vs Meta’s built-in path (where available):** local library + auto punctuation pacing + rehearsal feedback + installable offline PWA, without a Meta account — *competitive context*, not a claim of on-lens Meta Display support.

**INFERRED glasses-era insight:** many owners want eyes-up delivery before platforms give a great first-party HUD teleprompter; Spector bets on **web + honest device matrix** until native HUD APIs exist.

---

## 3. Target Users

| Segment | Evidence | Tag |
|---------|----------|-----|
| Primary: people rehearsing talks/pitches who want eyes-up delivery and hate reading notes | Homepage/README, samples (keynote/pitch/demo) | **INFERRED** |
| XREAL / Viture owners who can mirror a phone | Device matrix “Eyes-up” | **VERIFIED** (claimed + marketed); **UNKNOWN** how many real testers validated |
| Ray-Ban Meta Gen 1/2 owners (camera glasses, no display) | Device pages + matrix: phone rehearsal | **VERIFIED** as intended use |
| Ray-Ban Meta Display owners | Matrix: “Waiting” / not on lens | **VERIFIED** positioning; **UNKNOWN** whether Display WebView paths work |
| AAC / non-verbal / Deaf users (Say) | `/say` + README honesty that it’s untested with real AAC users | **VERIFIED** intent; **VERIFIED** unvalidated |
| Founding hardware beta testers | `#beta` Formspree; early access to glasses features | **VERIFIED** offer in copy; **UNKNOWN** signup volume |

---

## 4. Product Experience

### 4.1 Core loop (teleprompter)

**VERIFIED flow:**

1. Land on homepage → **Try Spector free** / sample → `app.html?script=…`, **or** `#try` paste / upload / samples → Launch.
2. Player: choose mode (Comfort / Focus / Presentation), speed (Slow / Normal / Fast), text size, leading, optional Mirror, Compact stage, word highlight.
3. Play (Space / K / tap) — engine advances chunks on `getMs()` schedule; rewind 3 chunks (R).
4. End screen: chunks, time, avg WPM, pacing consistency %, hesitations, slowest moment, optional section breakdown, **Copy script + stats** (ungated).
5. Landing shows local script library + recent rehearsal history (trend chart when ≥2 runs; last 50 runs kept on-device).

### 4.2 Pacing engine

**VERIFIED (`SpectorCore` in `public/spector-core.js`):**

- **Chunking (hybrid default):** split sentences → if ≤7 words keep sentence; else pack ~6-word groups. Also: `sentence` and `word` strategies registered.
- **Cues before hybrid merge:** `[pause]` / `[pause:Ns]` and `## Section` extracted as atomic chunks.
- **Timing (`computeMs`):** base by mode (focus 2400 / comfort 2800 / presentation 3200) × speed (slow 1.25 / fast 0.75); `×1.35` if chunk ends in `.!?`; `×1.15` if contains `,`; `×1.12` if contains `**…**`; floor 1200ms; plus pause extras.
- **Pause extras:** `[pause:Ns]` → N×1000; bare `[pause]` chunk → 2800; inline `[pause]` → 1800.
- **Shared editor helpers (2026-11):** `estimateDurationMs()` (editor's live “≈M:SS at <Speed>” estimate), `markdownToScript()` (`.md` import preserving cue syntax), `wordIndexForElapsed()` (word-level read-along highlight).

### 4.3 Hesitations

**VERIFIED:** a hesitation is recorded when the user **pauses early** on a line (`elapsed < expected * 0.85` in `stopPlayback`). Not mic-detected silence.

### 4.6 Scripts & storage

**VERIFIED local keys / behaviors:**

- Script library, draft / prefs / comfort tip / first-run flags in `localStorage`.
- Rehearsal runs in `spector_runs_v1` — capped at **50** for everyone.
- File upload / drag-drop (`.txt` + `.md`) / sample scripts on landing.
- **No** user accounts; **no** server-side script store; **no** product telemetry.

### 4.7 Offline / PWA

**VERIFIED (code):** `manifest.json` installable; `sw.js` precaches the shell (including `spector-core.js`); network-first for HTML + css/js/json with cache fallback. Bump the cache version when shipped assets change.

### 4.8 Analytics

**VERIFIED:** the only “analytics” are **in-product rehearsal feedback** computed locally on-device (consistency, hesitations, slowest chunk, pacing trend). There is **no** site analytics, no telemetry, no event beacons. Product questions are answered by talking to beta testers.

---

## 5. Hardware & Compatibility

Unchanged from the previous baseline: phone/computer full player (**VERIFIED works in code**); XREAL / Viture via mirror (**VERIFIED** product model); Ray-Ban Meta Gen 1/2 phone rehearsal; Meta Display not on lens; temple button = debug simulation; Desktop Comfort needs sensors or `?debug` tilt sim. Marketing-vs-reality rule stands: claim only what has been tested.

---

## 6. Current Feature Map

### Free — everything, for everyone (**VERIFIED**)

- Paste / upload (`.txt`, `.md`) / samples / launch
- Hybrid punctuation pacing + cue syntax
- Comfort / Focus / Presentation + speeds + size/leading
- Mirror, compact HUD, section jumps
- Word-level read-along highlight (toggle, persisted)
- End-screen analytics + **Copy script + stats**
- Local script library
- Last **50** rehearsals on-device
- Live duration estimate in the editor (engine-accurate)
- PWA / offline shell
- Say AAC composer
- No account, no mic listening, no watermark, no trial clock, no ads, no tracking

### Experimental / early / incomplete (**VERIFIED** unless noted)

| Item | State |
|------|--------|
| Say | Shipped v1; **untested with real AAC users** |
| Hardware beta | Recruiting; Comfort / temple controls need real-device validation |
| Cloud sync | Not shipped; not sold |
| Live translated captions | Documented non-start; needs backend + mic — architecture break |
| Cue authoring UX | Basic insert toolbar; deeper polish open |
| On-lens Meta Display | Waiting / research |
| Native App Store binaries | Explicit non-goal for now |

---

## 7. Website & Funnel

### Page map (**VERIFIED**)

| Page | Job |
|------|-----|
| `/` `index.html` | Convert curiosity → try: hero (H1 + CTA + live `#hero-demo`), proof, Try, devices matrix, free-&-open-source note, FAQ, hardware beta, founder line |
| `/app.html` | Deliver product (player) |
| `/say` | AAC side-product + mission signal |
| `/ray-ban-meta-teleprompter`, `/teleprompter-for-xreal`, `/teleprompter-for-viture` | SEO / honesty per device → try + beta |
| `/privacy` | Privacy truth: no accounts, no servers, no analytics, data stays on device |
| `beta-test.html` (`/beta/test`) | Private beta-test route |
| `sw-prime.html` / `verify-sw.html` | SW / verification helpers |

### Navigation & CTAs (**VERIFIED**)

- Primary CTA: **Try Spector free** → sample player.
- Secondary: `#try` paste path, `#beta`, GitHub.
- Funnel: Awareness → hero comprehension → Try free (critical activation) → paste own script / Comfort / finish run → local history + feedback loop. Repeat rehearsal is the retention mechanic — there is no paywall step.

---

## 9. Technical Architecture

```
SPECTOR/ (static)
├── public/                 # entire product surface
│   ├── index.html          # landing + library + history UI + editor JS
│   ├── app.html            # player + tests + debug
│   ├── spector-core.js     # SpectorCore pure logic (shared)
│   ├── say.html            # SayCore / AAC scan UI + tests
│   ├── style.css / style.min.css
│   ├── landing-v2.css / landing-v2.min.css
│   ├── sw.js / sw-prime.html / manifest.json
│   └── images/…
├── tests/run_verification.py
├── vercel.json             # build + rewrites + security headers + CSP
├── package.json            # clean-css only
└── docs/                   # PROJECT, BRAND, DOMAIN, META_BRAIN
```

### Where major logic lives (**VERIFIED**)

| Concern | Location |
|---------|----------|
| Chunking, timing, analytics math, motion, cues, editor helpers | `public/spector-core.js` → `window.SpectorCore` |
| Player UI / rehearsal recording | `public/app.html` |
| Landing library, history chart, samples, forms, estimate, .md import | `public/index.html` inline JS |
| AAC scanning | `public/say.html` |
| Offline | `public/sw.js` |
| Build | `npm run build` → min CSS committed |
| Deploy | Vercel `outputDirectory: public`, GitHub `main` |
| External services | Formspree (tips/beta), Google Fonts, GitHub API for stars |
| Storage | browser `localStorage` only for product data |

### Dependencies (**VERIFIED**)

- Runtime app: **zero npm deps**; third-party runtime: Formspree, fonts.googleapis, GitHub API.
- Dev: `clean-css-cli` (pinned, lockfile committed).

---

## 10. Current Product State

| Area | Assessment | Tag |
|------|------------|-----|
| Phone/desktop teleprompter loop | Production-ready for serious rehearsal | **VERIFIED** feature-complete in code |
| Punctuation pacing + cues | Production-ready | **VERIFIED** |
| Rehearsal feedback v1/v2 | Functional / useful; not deep coaching | **VERIFIED** shipped |
| Comfort spatial | Functional; desktop needs sim/sensors; real-glasses feel unvalidated at scale | **UNKNOWN** field quality |
| PWA offline | Working for player shell | **VERIFIED** |
| Say | Functional v1; early | **VERIFIED** |
| Device SEO pages | Shipped; honest Meta copy | **VERIFIED** |
| Docs drift | TESTING/CONTRIBUTING partially stale (pre-existing) | **VERIFIED** |

**Technically risky (INFERRED):** Formspree as sole lead capture; Comfort + iOS permission UX; any future mic/translation direction breaking “nothing uploaded.”

---

## 11. Strengths

1. Clear, falsifiable product insight (punctuation pace, no mic). **VERIFIED**
2. Honest device matrix. **VERIFIED**
3. Portable core (`spector-core.js`). **VERIFIED**
4. Privacy architecture matches promise — local-first, static, no telemetry. **VERIFIED**
5. Free + MIT removes every adoption objection. **VERIFIED**
6. Brand implementation matches BRAND.md. **VERIFIED**
7. End-to-end rehearsal loop with measurable feedback. **VERIFIED**
8. Public repo as distribution and trust channel. **VERIFIED**

## 12. Weaknesses

1. Glasses story is mostly mirroring. **INFERRED**
2. Hardware validation incomplete. **VERIFIED** as open work
3. Say unvalidated with AAC users. **VERIFIED** caveat
4. Doc contradictions (TESTING, CONTRIBUTING, parts of CHANGELOG) undermine the honesty brand if found. **VERIFIED**
5. Funnel activation depends on users hitting Play with enough script to feel punctuation pacing. **INFERRED**
6. Cue authoring still basic. **VERIFIED** open item
7. Landing section density vs BRAND “hero budget” discipline. **INFERRED**

## 13. Risks

| Risk | Why it matters | Tag |
|------|----------------|-----|
| Overclaiming Meta Display / temple controls | Trust collapse | **VERIFIED** stale TESTING text exists |
| Privacy promise broken by future features (translation, accounts, analytics) | Strategic identity risk | **VERIFIED** called out in PROJECT |
| Marketing offline style skew (`*.min.css` vs precache) | Cosmetic offline marketing FOUC — **not** a player-offline failure | **INFERRED** |
| Treating headless Chrome hangs as PWA failure | False “offline broken” diagnoses | **VERIFIED** process risk |
| Adoption stall without hardware proof | Growth | **INFERRED** |
| Design-branch resurrection (`unify-and-deslop`) | Reintroduces rejected purple/Inter player | **VERIFIED** process risk |

## 14. Open Questions

1. **UNKNOWN:** Real-world Comfort quality on glasses.
2. **UNKNOWN:** Formspree beta volume; which devices testers actually own.
3. **UNKNOWN:** Whether Meta Web App / Developer Mode path still matches TESTING.md steps.
4. **UNKNOWN:** AAC user feedback on Say.
5. **UNKNOWN:** Trademark / brand conflict risk for “Spector”.
6. **RESOLVED:** PWA/SW offline for `app.html` — verified; cache-version bumps for shipped changes are fine, behavior churn is not.

## 15. Confirmed Decisions

Locked unless explicitly revisited:

1. Delivery-first homepage H1. **VERIFIED**
2. **Free and open source (MIT); no monetization; no analytics or telemetry.** **VERIFIED** (2026-11 decision — supersedes the abandoned “Pro $34 once” experiment recorded only in CHANGELOG)
3. Cloud sync not sold until shipped. **VERIFIED**
4. Honest device matrix. **VERIFIED**
5. Static zero-backend architecture. **VERIFIED**
6. Light marketing + dark player; teal accent; Instrument Sans; ink CTAs. **VERIFIED**
7. No purple / Inter / glassmorphism AI look. **VERIFIED**
8. Say is separate from teleprompter. **VERIFIED**
9. `origin/design/unify-and-deslop` is non-authoritative. **VERIFIED**
10. Baseline product truth = `main`. **VERIFIED**
11. Do not churn `sw.js` behavior; bump its cache version only when shipped assets change. **VERIFIED**
12. Headless Chrome hangs are not PWA failure evidence. **VERIFIED**

## 16. Things We Must Not Break

1. **Punctuation timing semantics** (`computeMs`, pause tags, hybrid chunking).
2. **Privacy promise** — no silent uploads, no mic for pacing, no analytics/telemetry.
3. **Free surface** — every feature works without paywall, account, or tracking.
4. **Device honesty** — especially Meta Display status.
5. **`SpectorCore` test harness** (`app.html?test`) and verifier entrypoint.
6. **CSP / Permissions-Policy** scoped to the actual third-party surface.
7. **Brand tokens** — accent not CTA; Instrument Sans; light marketing canvas.
8. **Local storage data model** for scripts/runs without forcing accounts.
9. **Working Service Worker offline path** — no behavior churn without a real-browser regression.

## 17. Strategic Priorities

1. **Activation:** maximize first-session “commas breathe / periods hold” aha.
2. **Hardware proof:** real XREAL/Viture mirror validation + short honest proof.
3. **Doc hygiene:** align TESTING.md / CONTRIBUTING.md with BRAND/PROJECT.
4. **Say validation with real users** before feature expansion.
5. **Keep architecture constraints** — don’t start translation/backend/analytics until a deliberate plan.

## 18. Deferred / Do Not Work On Yet

- Native App Store / Play binaries
- User accounts / server backend
- Cloud sync implementation
- Live translated captions / continuous mic capture
- Any analytics/telemetry reintroduction (requires an explicit, deliberate decision)
- Claiming Meta Display / Neural Band support
- Merging `origin/design/unify-and-deslop`
- Broad CSS/HTML refactors “for cleanliness” without a product hypothesis
- Modifying `sw.js` behavior without a real-browser Offline regression

---

*Generated as documentation only. No application code, CSS, HTML, assets, routes, config, or dependencies were modified to produce this file.*
