# SPECTOR META BRAIN

Strategic source of truth for future Spector work.  
**Baseline:** `c68909a` — *Unify satellite page design with homepage* (`main` / `origin/main`).  
**Non-authoritative:** `origin/design/unify-and-deslop` — do not merge, cherry-pick, or copy unless explicitly instructed.

Claim tags used below:

- **VERIFIED** — confirmed from code, committed docs, or git state this session
- **INFERRED** — reasonable conclusion from evidence; not a hard fact
- **UNKNOWN** — cannot be established from the repository alone

---

## 0. Current Baseline

| Item | Status |
|------|--------|
| Canonical commit | **VERIFIED:** `c68909a56a1c3f4454c2c676c7e089119b01f59c` |
| Branch | **VERIFIED:** `main` tracks `origin/main` at that commit |
| Product shape | **VERIFIED:** static PWA in `public/`; no app server; Vercel hosts `public/` |
| Monetization | **VERIFIED:** free core; Spector Pro `$34` once via Paddle (`public/js/paddle-pro.js`) |
| Brand surface (marketing) | **VERIFIED:** light canvas `#F7F7F8`, ink CTAs, teal accent `#0E7C74`, Instrument Sans |
| Player surface | **VERIFIED:** dark reading stage (`body.glasses`), shared accent family |
| Forbidden as source | **VERIFIED (process):** `origin/design/unify-and-deslop` restores rejected purple/dark/Inter player language — ignore unless ordered |

**Local note:** a separate checkout at `~/Projects/SPECTOR` may lag this baseline. Treat **this** repo at `c68909a` as truth for Meta Brain.

---

## 1. What Spector Is

**VERIFIED:** Spector is an open-source, punctuation-paced teleprompter PWA. Users paste (or load) a script; the engine chunks it and advances on a timer shaped by punctuation, mode, and speed — **not** by microphone / speech recognition.

**VERIFIED positioning (site H1 / brand):**  
“Your punctuation sets the pace — not your voice.”

**VERIFIED permanent promise:**  
“Free core, forever. No account, no cloud, nothing uploaded — ever.”

**VERIFIED pairing tagline:**  
“Punctuation-paced. No mic. No cloud.”

**VERIFIED product job:** rehearse on phone/computer → perform eyes-up where a display can show the script (today: XREAL / Viture via mirror). Ray-Ban Meta path is phone rehearsal, not on-lens Spector.

**VERIFIED sister surface:** `/say` — switch-scan AAC composer (row-column scanning), separate from the teleprompter but same privacy / static architecture.

**What Spector is not (VERIFIED in brand/legal/README):** not smart glasses hardware; not affiliated with Meta / Ray-Ban / XREAL / Viture; not a mic-listening coach; not a cloud SaaS with accounts.

---

## 2. Core Product Insight

**VERIFIED insight in product + marketing:** Pace should come from **how the script is written** (commas breathe, periods hold, emphasis holds longer), not from listening to the speaker. That removes mic permission, privacy anxiety, and “is it hearing me?” failure modes.

**INFERRED strongest differentiator vs Meta’s built-in path (where available):** local library + auto punctuation pacing + rehearsal analytics + installable offline PWA, without a Meta account — *competitive context*, not a claim of on-lens Meta Display support.

**INFERRED glasses-era insight:** many owners want eyes-up delivery before platforms give a great first-party HUD teleprompter; Spector bets on **web + honest device matrix** until native HUD APIs exist.

---

## 3. Target Users

| Segment | Evidence | Tag |
|---------|----------|-----|
| Primary: people rehearsing talks/pitches who want eyes-up delivery and hate reading notes | Homepage/README (“Talk to camera. Not to your notes.”), samples (keynote/pitch/demo) | **INFERRED** |
| XREAL / Viture owners who can mirror a phone | Device matrix “Eyes-up”; proof image captioned as mirrored FOV | **VERIFIED** (claimed + marketed); **UNKNOWN** how many real testers validated |
| Ray-Ban Meta Gen 1/2 owners (camera glasses, no display) | Device pages + matrix: phone rehearsal | **VERIFIED** as intended use |
| Ray-Ban Meta Display owners | Matrix: “Waiting” / not on lens; phone rehearsal works | **VERIFIED** positioning; **UNKNOWN** whether Display WebView paths work beyond marketing docs |
| AAC / non-verbal / Deaf users (Say) | `/say` + README honesty that it’s untested with real AAC users | **VERIFIED** intent; **VERIFIED** unvalidated with real users |
| Founding hardware beta testers | `#beta` Formspree; Pro free for life for invite-capped testers | **VERIFIED** offer in copy; **UNKNOWN** signup volume / conversion |

**Most likely initial paying user (INFERRED):** someone who rehearses repeatedly on one device, hits the **5-run history cap**, and wants longer history and/or copy-script+stats export — or a hardware beta invitee who would have paid but gets Pro free.

---

## 4. Product Experience

### 4.1 Core loop (teleprompter)

**VERIFIED flow:**

1. Land on homepage → **Try Spector free** / sample → `app.html?script=…` (base64 of URI-encoded sample), **or** `#try` paste / upload / samples → Launch.
2. Player: choose mode (Comfort / Focus / Presentation), speed (Slow / Normal / Fast), text size, leading, optional Mirror, Compact stage.
3. Play (Space / K / tap) — engine advances chunks on `getMs()` schedule; rewind 3 chunks (R).
4. End screen: chunks, time, avg WPM, pacing consistency %, hesitations, slowest moment; optional section breakdown; Pro export.
5. Landing can show local script library + recent rehearsal history (trend chart when ≥2 runs).

### 4.2 Pacing engine

**VERIFIED (`SpectorCore` in `public/app.html`):**

- **Chunking (hybrid default):** split sentences → if ≤7 words keep sentence; else pack ~6-word groups. Also: `sentence` and `word` strategies registered.
- **Cues before hybrid merge:** `[pause]` / `[pause:Ns]` and `## Section` extracted as atomic chunks.
- **Timing (`computeMs`):** base by mode (focus 2400 / comfort 2800 / presentation 3200) × speed (slow 1.25 / fast 0.75); `×1.35` if chunk ends in `.!?`; `×1.15` if contains `,`; `×1.12` if contains `**…**`; floor 1200ms; plus pause extras.
- **Pause extras:** `[pause:Ns]` → N×1000; bare `[pause]` chunk → 2800; inline `[pause]` → 1800.
- **Visual pacing cues:** commas / terminators get CSS markers (`cue-breathe` / `cue-hold`); emphasis styled.

### 4.3 Hesitations

**VERIFIED:** a hesitation is recorded when the user **pauses early** on a line (`elapsed < expected * 0.85` in `stopPlayback`). End copy: “you paused before the line finished.” Not mic-detected silence.

### 4.4 Modes & controls

| Control | Behavior | Tag |
|---------|----------|-----|
| Comfort | Longer base timing + Kalman-filtered device orientation → translate/rotate/scale; breathing/drift when idle; respects `prefers-reduced-motion` for live transform | **VERIFIED** |
| Focus | Default; steady center read; shorter base than Comfort | **VERIFIED** |
| Presentation | Slowest base; “heavier” type (mode CSS) | **VERIFIED** |
| Speeds | Slow / Normal / Fast multipliers | **VERIFIED** |
| Mirror | Horizontal flip for camera/mirror rigs; controls stay usable | **VERIFIED** (CHANGELOG notes prior flip bug fixed) |
| Compact stage | HUD compaction; defaults on short/narrow viewports | **VERIFIED** |
| Motion permit | iOS-style DeviceOrientation permission for Comfort | **VERIFIED** |
| Bookmarks | `##` → jump bar | **VERIFIED** |
| Debug | `app.html?debug` temple-button / tilt sim | **VERIFIED** |
| Tests | `app.html?test` → `SpectorTest` harness | **VERIFIED** |

### 4.5 Rehearsal vs performance

**INFERRED product model (supported by copy + matrix):**

- **Rehearse:** phone/desktop full player + analytics + library.
- **Perform eyes-up:** mirror phone/computer to XREAL/Viture (or any mirrored display). Ray-Ban Meta = rehearse on phone, perform without Spector on the lens.

### 4.6 Scripts & storage

**VERIFIED local keys / behaviors:**

- Script library in `localStorage` (landing + player persistence patterns).
- Draft / prefs / comfort tip / first-run flags in `localStorage`.
- Rehearsal runs in `spector_runs_v1` (capped 5 free / 50 Pro via `SpectorPro.historyLimit()`).
- Pro flag: `localStorage.spector_pro` (honor-system; unlock via Paddle checkout or pasted `txn_…` / ≥8 char token).
- File upload / drag-drop / sample scripts on landing.
- **No** user accounts; **no** server-side script store.

### 4.7 Offline / PWA

**VERIFIED:** `manifest.json` installable; `sw.js` cache `spector-v12` precaches index/app/say/`style.css`/manifest/verify helpers. Network-first for HTML + css/js/json with cache fallback.

**INFERRED risk:** production pages load `style.min.css` / `landing-v2.min.css`, but SW precache lists `style.css` only — offline styling for marketing may be incomplete until those assets were previously network-cached. Core player shells still intended to work offline after a warm visit.

### 4.8 Analytics (product + site)

**VERIFIED:**

- **In-product rehearsal analytics:** end screen consistency (variance of actual/expected ratios), hesitations, slowest chunk; section analytics; landing history + SVG pacing trend.
- **Site analytics:** Vercel Web Analytics via `analytics.js` / `window.va` (skipped on localhost); privacy policy states cookieless aggregates; rehearsal completed event fired from player.
- Scripts/emails not sent to analytics (**VERIFIED** privacy copy + architecture).

---

## 5. Hardware & Compatibility

| Hardware | Claimed today | What code actually does | Tag |
|----------|---------------|---------------------------|-----|
| Phone / computer | Full teleprompter | Browser PWA; full player | **VERIFIED** works in code |
| XREAL / Viture | Eyes-up via mirror | Same web UI mirrored to glasses display; no vendor SDK | **VERIFIED** as product model; **UNKNOWN** formal QA matrix results in-repo |
| Ray-Ban Meta Gen 1/2 | Phone rehearsal only | No glasses display API in repo | **VERIFIED** honesty on site |
| Ray-Ban Meta Display | Not on lens yet; phone rehearsal | No Meta HUD SDK integration | **VERIFIED** site/docs; **CONTRADICTION:** `TESTING.md` still describes opening Spector “on your glasses” / HUD models running on lens — **stale vs homepage/PROJECT** |
| Temple button / Neural Band | Debug `B` / simulator; future where platform forwards events | Simulation + keybinding in player; no proprietary BLE | **VERIFIED** simulation; **UNKNOWN** real Meta Display button forwarding |
| Brilliant Labs / Even Realities / others | Mentioned as beta interest | Not implemented specially | **VERIFIED** mentioned; **UNKNOWN** support |
| Desktop Comfort | Inert without sensors; DevTools Sensors / `?debug` tilt | Explicit in UI copy | **VERIFIED** |

**Marketing vs reality rule (CONFIRMED decision in PROJECT/BRAND):** claim only what has been tested; Meta is competitor + research horizon, not primary homepage story.

---

## 6. Current Feature Map

### Free core (**VERIFIED**)

- Paste / upload / samples / launch
- Hybrid punctuation pacing + cue syntax
- Comfort / Focus / Presentation + speeds + size/leading
- Mirror, compact HUD, section jumps
- End-screen analytics (basic)
- Local script library
- Last **5** rehearsals on-device
- PWA / offline shell (as implemented)
- Say AAC composer
- No account, no mic listening, no watermark, no trial clock (pricing copy)

### Spector Pro — $34 once (**VERIFIED**)

- History **50** vs **5**
- End-screen **Copy script + stats**
- Unlock restore via transaction id (honor system)
- Explicitly **not** cloud sync

### Experimental / early / incomplete (**VERIFIED** unless noted)

| Item | State |
|------|--------|
| Say | Shipped v1; **untested with real AAC users** (README/PROJECT) |
| Hardware beta | Recruiting; Comfort / temple controls need real-device validation |
| Cloud sync | Not shipped; explicitly excluded from Pro |
| Live translated captions | Documented non-start; needs backend + mic — architecture break |
| Cue authoring UX | Basic insert toolbar; deeper polish open (PROJECT) |
| Analytics depth | End screen + trend chart; richer insight open |
| On-lens Meta Display | Waiting / research |
| Native App Store binaries | Explicit non-goal for now |

---

## 7. Website & Conversion Funnel

### Page map (**VERIFIED**)

| Page | Job |
|------|-----|
| `/` `index.html` | Convert curiosity → try: dark hero (H1 + CTA + `launch.mp4`), proof, Try, devices matrix, Pro teaser, FAQ, tips email, hardware beta, close CTA |
| `/pricing` | Convert trust → pay: Free vs Pro ledger, embedded Paddle, license restore, billing FAQ |
| `/app.html` | Deliver product (player) — primary conversion destination |
| `/say` | AAC side-product + mission signal; not the main monetization funnel |
| `/ray-ban-meta-teleprompter` | SEO / honesty for Meta owners → try + beta |
| `/teleprompter-for-xreal` | SEO for XREAL eyes-up path → try |
| `/teleprompter-for-viture` | SEO for Viture eyes-up path → try |
| `/privacy` `/terms` `/refund` | Legal trust for Paddle + buyers (14-day refund) |
| `sw-prime.html` / `verify-sw.html` | SW / verification helpers |

### Navigation & CTAs (**VERIFIED**)

- Primary CTA label: **Try Spector free** → sample player (`data-quick-start`).
- Secondary: Pricing, `#try` paste path, `#beta`, Buy Pro ($34).
- Rewrites in `vercel.json` for pretty URLs.

### Funnel (INFERRED)

```
Awareness (SEO device pages / OG / GitHub)
  → Homepage hero comprehension (punctuation insight)
  → Try free (sample in player)  [critical activation]
  → Optional: paste own script / Comfort / finish run
  → See analytics + history cap
  → Pricing / end-screen Pro upsell
  → Paddle checkout → localStorage pro
```

**Friction points (INFERRED):** users who bounce before Play never feel punctuation pacing; Comfort needs motion permission; Pro value is thin if user never keeps history or exports.

---

## 8. Brand System

### Documented (`docs/BRAND.md`) — **VERIFIED** aligned with `:root` in `style.css` for core tokens

| Domain | Spec |
|--------|------|
| Type | Instrument Sans only (display + body); avoid Inter |
| Marketing colors | `#F7F7F8` bg, ink `#0A0A0C` text/CTAs, accent `#0E7C74` (not for CTA fills) |
| Player | Dark `#0A0A0C` stage; accent `#2A9B90` / `#5EC4B8` |
| Radii | 8 / 12; no 9999px pill CTAs (`--radius-pill` remapped to `--radius-lg`) |
| Voice | Direct, second-person, short; falsifiable claims; no fake testimonials |
| Feel | Resend/Linear-like restraint; anti purple-glow / glass / cream-terracotta AI defaults |

### Implementation notes

- **VERIFIED:** homepage + pricing + legal + device pages use Instrument + `landing-v2` composition; Say stays dark glasses UI with `style.min.css` only (no landing-v2) — intentional satellite unify at `c68909a`.
- **CONTRADICTION — CHANGELOG v1.9:** still describes full-pill primary buttons and older radii; brand/CSS moved to 8/12 demoted pills. Treat **CSS + BRAND.md** as authoritative over that changelog line.
- **CONTRADICTION — CONTRIBUTING.md:** still says “glassmorphism” as a priority — **legacy**; BRAND forbids glass blur.
- **CONTRADICTION — TESTING.md:** overstates Ray-Ban on-lens readiness vs BRAND/PROJECT/homepage honesty.
- **INFERRED intentional:** dark hero plane vs light body; player always dark for legibility.
- **INFERRED legacy:** some older asset names (`hero-glasses.webp`, dark/light app icon variants) may predate current light marketing; current hero uses `launch.mp4` + `proof-glasses.webp`.

---

## 9. Technical Architecture

```
SPECTOR/ (static)
├── public/                 # entire product surface
│   ├── index.html          # landing + library + history UI + funnel JS
│   ├── app.html            # player + SpectorCore + tests + debug
│   ├── say.html            # SayCore / AAC scan UI + tests
│   ├── pricing.html (+ legal + device SEO pages)
│   ├── style.css / style.min.css
│   ├── landing-v2.css / landing-v2.min.css
│   ├── js/paddle-pro.js    # Pro entitlement + Paddle overlay
│   ├── analytics.js        # Vercel Insights loader
│   ├── sw.js / sw-prime.html / manifest.json
│   └── images/…            # logo, OG, hero film, proof stills
├── tests/run_verification.py
├── vercel.json             # build + rewrites + CSP
├── package.json            # clean-css only
└── docs/                   # PROJECT, BRAND, PADDLE, DOMAIN, META_BRAIN
```

### Where major logic lives (**VERIFIED**)

| Concern | Location |
|---------|----------|
| Chunking, timing, analytics math, motion, cues | `public/app.html` → `window.SpectorCore` |
| Player UI / rehearsal recording / Pro export gate | `public/app.html` |
| Landing library, history chart, samples, forms | `public/index.html` inline JS |
| AAC scanning | `public/say.html` (`SayCore`-style pure funcs + DOM) |
| Payments | `public/js/paddle-pro.js` + Paddle.js CDN |
| Offline | `public/sw.js` |
| Build | `npm run build` → min CSS committed |
| Deploy | Vercel `outputDirectory: public`, GitHub `main` |
| External services | Paddle, Formspree (tips/beta), Google Fonts, Vercel Analytics, optional GitHub API for stars |
| Storage | browser `localStorage` only for product data |
| APIs | none owned; client tokens only |

### Dependencies (**VERIFIED**)

- Runtime app: **zero npm deps** in the browser app itself.
- Dev: `clean-css-cli`.
- Third-party runtime: Paddle.js, Formspree, fonts.googleapis, Vercel insights script.

### Security / monetization honesty (**VERIFIED** in PADDLE.md)

Pro is spoofable via DevTools; accepted for now. No backend Transactions API validation.

---

## 10. Current Product State

| Area | Assessment | Tag |
|------|------------|-----|
| Phone/desktop teleprompter loop | Production-ready for serious rehearsal | **VERIFIED** feature-complete in code; **INFERRED** “production” from live site + tests present |
| Punctuation pacing + cues | Production-ready | **VERIFIED** |
| Rehearsal analytics v1/v2 | Functional / useful; not deep coaching | **VERIFIED** shipped; **INFERRED** “rough” depth |
| Comfort spatial | Functional; desktop needs sim/sensors; real-glasses feel unvalidated at scale | **VERIFIED** code; **UNKNOWN** field quality |
| PWA offline | Implemented + verifier path exists | **VERIFIED** code; health is **re-run dependent** (PROJECT) |
| Pro checkout | Live Paddle product/price IDs in client | **VERIFIED** in paddle-pro.js / PADDLE.md |
| Say | Functional v1; early | **VERIFIED** |
| Device SEO pages | Shipped; honest Meta copy | **VERIFIED** |
| Hardware integration depth | Thin (mirror + debug keys) | **VERIFIED** |
| Docs drift | TESTING/CONTRIBUTING partially stale | **VERIFIED** contradictions |
| Broken | No confirmed product-breaking defect at baseline from static read | **UNKNOWN** without fresh verifier/prod probe this session |

**Technically risky (**INFERRED**):** honor-system Pro; Formspree as sole lead capture; SW/min.css offline skew; Comfort + iOS permission UX; any future mic/translation direction breaking “nothing uploaded.”

**Marketing claims needing ongoing verification:** “XREAL/Viture eyes-up works today” (mirror workflow — true as browser mirror, not as native app); beta Pro-for-life fulfillment process (**UNKNOWN** ops detail).

---

## 11. Strengths

1. **Clear, falsifiable product insight** (punctuation pace, no mic) — rare honesty in wearable-adjacent software. **VERIFIED**
2. **Honest device matrix** — builds trust vs vapor “works on all AR glasses.” **VERIFIED**
3. **Portable core (`SpectorCore`)** — chunk/time/motion/analytics separable for future ports. **VERIFIED**
4. **Privacy architecture matches promise** — local-first, static hosting. **VERIFIED**
5. **Tight free→Pro story** (once, no subscription, sync not fake-sold). **VERIFIED**
6. **Brand implementation largely matches BRAND.md** after light/teal unify — anti-slop tokens present. **VERIFIED**
7. **End-to-end rehearsal loop** with measurable feedback (consistency / hesitations / slowest). **VERIFIED**
8. **MIT + public repo** as distribution and trust channel. **VERIFIED**

---

## 12. Weaknesses

1. **Pro value may feel thin** vs free core (history cap + export only). **INFERRED**
2. **Glasses story is mostly mirroring** — differentiated pacing engine, undifferentiated display path. **INFERRED**
3. **Hardware validation incomplete** — Phase 1 open in PROJECT. **VERIFIED** as open work
4. **Say unvalidated** with AAC users; risk of well-intentioned but unusable UX. **VERIFIED** caveat
5. **Doc contradictions** (TESTING, CONTRIBUTING, parts of CHANGELOG) undermine “honesty” brand if found. **VERIFIED**
6. **Funnel activation** depends on users hitting Play with enough script to feel commas/periods. **INFERRED**
7. **Cue authoring** still basic. **VERIFIED** open item
8. **CONTRIBUTING still praises glassmorphism** — cultural drift risk for contributors. **VERIFIED**
9. **Landing complexity** (many sections: try disclosure, library, history, tips, beta, founder) vs BRAND “hero budget” discipline — mostly OK but density can confuse. **INFERRED**

---

## 13. Risks

| Risk | Why it matters | Tag |
|------|----------------|-----|
| Overclaiming Meta Display / temple controls | Trust collapse; Paddle/brand damage | **VERIFIED** stale TESTING text exists |
| Pro spoof / support burden | Low financial risk; support confusion | **VERIFIED** known |
| Privacy promise broken by future features (translation, accounts) | Strategic identity risk | **VERIFIED** called out in PROJECT |
| Offline/PWA cache skew (`*.min.css` vs precache) | “Broken offline” reports | **INFERRED** |
| Adoption stall without hardware proof videos/testimonials | Growth | **INFERRED**; no fake testimonials policy **VERIFIED** |
| Split mission (teleprompter vs AAC vs translation) | Dilution | **INFERRED**; PROJECT deliberately separates them **VERIFIED** |
| Design-branch resurrection (`unify-and-deslop`) | Reintroduces rejected purple/Inter player | **VERIFIED** process risk |

---

## 14. Open Questions

1. **UNKNOWN:** Fresh `python3 tests/run_verification.py` result on this machine/session (PROJECT says re-run; do not assume green from old notes).
2. **UNKNOWN:** Real-world Comfort quality on XREAL/Viture/Meta Display WebViews.
3. **UNKNOWN:** Conversion rates Try→Play→End→Pro; Formspree beta volume.
4. **UNKNOWN:** Whether Meta Web App / Developer Mode path still matches TESTING.md steps in 2026.
5. **UNKNOWN:** How many users hit the 5-run cap (is Pro priced to a real pain?).
6. **UNKNOWN:** AAC user feedback on Say (scan speed defaults, phrase rows, SPEAK via `speechSynthesis`).
7. **UNKNOWN:** Trademark / brand conflict risk for “Spector” (DOMAIN.md mentions check; outcome not recorded as final).
8. **UNKNOWN:** Whether minified CSS offline gap is user-visible in practice.

---

## 15. Confirmed Decisions

Treat these as locked unless explicitly revisited:

1. **Punctuation-paced, no-mic positioning** is primary (not “Eyes Forward” as H1). **VERIFIED** BRAND
2. **Free core forever; Pro $34 once; no subscription.** **VERIFIED**
3. **Cloud sync not sold until shipped.** **VERIFIED**
4. **Honest device matrix** — no claiming Ray-Ban Meta Display on-lens Spector. **VERIFIED**
5. **Static zero-backend architecture** for the core product. **VERIFIED**
6. **Light marketing + dark player; teal accent; Instrument Sans; ink CTAs.** **VERIFIED**
7. **No purple / Inter / glassmorphism / cream-terracotta AI look.** **VERIFIED** BRAND
8. **Say is separate from teleprompter; live translation is a different architecture decision.** **VERIFIED** PROJECT
9. **Honor-system Pro is accepted** for now. **VERIFIED** PADDLE
10. **`origin/design/unify-and-deslop` is non-authoritative.** **VERIFIED** (process instruction / Meta Brain baseline)
11. **Baseline product truth = `main` @ `c68909a`.** **VERIFIED**

---

## 16. Things We Must Not Break

1. **Punctuation timing semantics** (`computeMs`, pause tags, hybrid chunking) — the product *is* this feel.
2. **Privacy promise** — no silent uploads of scripts; no mic for pacing.
3. **Free core surface** — modes, pacing, Comfort, offline-capable rehearsal without paywall.
4. **Pro honesty** — don’t sell sync or features that aren’t live.
5. **Device honesty** — especially Meta Display status.
6. **`SpectorCore` test harness** (`app.html?test`) and verifier entrypoint.
7. **Paddle load pattern** (`async`, not `defer`) — documented footgun.
8. **CSP / Permissions-Policy** allowing Paddle payment frames.
9. **Brand tokens** — accent not CTA; Instrument Sans; light marketing canvas.
10. **Local storage data model** for scripts/runs/pro without forcing accounts.

---

## 17. Strategic Priorities

Ordered for leverage (INFERRED strategy on VERIFIED facts):

1. **Activation:** maximize first-session “commas breathe / periods hold” aha (sample → play → end screen).
2. **Hardware proof:** real XREAL/Viture mirror validation + short honest proof (not Meta on-lens fiction).
3. **Doc hygiene:** align TESTING.md / CONTRIBUTING.md with BRAND/PROJECT so honesty isn’t undercut.
4. **Pro value clarity:** either prove history/export matter, or define the *next* shippable Pro benefit that doesn’t break privacy.
5. **Say validation with real users** before feature expansion.
6. **Keep architecture constraints** — don’t start translation/backend until deliberate plan.

---

## 18. Deferred / Do Not Work On Yet

From PROJECT explicit non-goals + Meta Brain judgment:

- Native App Store / Play binaries
- User accounts / server backend (unless a deliberate new product line)
- Cloud sync implementation
- Live translated captions / continuous mic capture
- Plugin marketplace
- Claiming Meta Display / Neural Band support
- Video recording / multi-device director mode
- Redesigning the player or reopening purple/dark Inter branch aesthetics
- Merging `origin/design/unify-and-deslop`
- Broad CSS/HTML refactors “for cleanliness” without a product hypothesis

---

## 19. Recommended Next Experiments

Small, evidence-seeking moves (do **not** implement in Meta Brain phase):

1. **Instrumented activation funnel** (already have Vercel events): measure Try click → Play → End → Pro CTA. **INFERRED** next measurement.
2. **Hardware beta protocol:** fixed script + Comfort vs Focus on XREAL/Viture; capture whether mirror lag kills trust. **VERIFIED** need in PROJECT.
3. **History-cap experiment messaging:** show free users “4/5 rehearsals kept” earlier — test if Pro intent rises. **INFERRED**
4. **Say user test (n=3–5 AAC/switch users):** scan speed, BACK affordance, SPEAK usefulness — ship feedback before features. **VERIFIED** next step per PROJECT.
5. **TESTING.md honesty patch** (docs-only): remove on-lens overclaims so beta testers aren’t misled. **VERIFIED** contradiction to fix.
6. **Offline warm-path check:** cold install → offline open app — confirm min CSS behavior. **INFERRED** tech experiment.

---

## META BRAIN SUMMARY

**What Spector needs to become successful**

Spector wins if people who rehearse for camera **feel** punctuation-paced delivery in one session, trust the **no-mic / no-cloud** promise, and have a **credible eyes-up path** (today: phone + XREAL/Viture mirror — not Meta Display theater). Monetization works only if free is generous and Pro is a clear, honest upgrade for repeat rehearters — not fake sync.

**What to focus on next**

1. Protect the baseline (`c68909a`) and the punctuation/privacy identity.  
2. Improve **first-run aha → completed rehearsal** without redesign churn.  
3. Gather **real glasses evidence** for the mirror path; keep Meta claims cold and accurate.  
4. Fix **doc contradictions** that threaten the honesty brand.  
5. Validate **Say** with real users before expanding accessibility scope.  
6. Do **not** chase backends, translation, App Store, or the rejected design branch until the core rehearsal wedge is proven with evidence.

---

*Generated as documentation only. No application code, CSS, HTML, assets, routes, config, or dependencies were modified to produce this file. Not committed by the Meta Brain phase.*
