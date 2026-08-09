# SPECTOR — Project Status & Roadmap 

**Last updated:** August 9, 2026 (reconciled with current homepage / brand story: punctuation-paced positioning, honest device matrix, shipped vs roadmap cleanup)
**Repository:** [github.com/hydrogenbondss/SPECTOR](https://github.com/hydrogenbondss/SPECTOR)  
**Live URL:** https://spectorlabs.io
**Latest commit:** current (see git log)

---

## Executive summary

SPECTOR is a free, open-source **punctuation-paced teleprompter** PWA for serious rehearsal and the smart-glasses era. Pace comes from the script — commas breathe, periods hold — not from a microphone. Core use is local: **no account, no cloud, nothing uploaded**.

**Today:** rehearse on phone or computer; go eyes-up by mirroring to **XREAL or Viture**. Ray-Ban Meta Gen 1/2 and Ray-Ban Meta Display are **phone-rehearsal** paths — SPECTOR does **not** currently run on the Meta Display lens. Meta remains competitive context and a possible future platform option, not the primary product story.

SPECTOR sells teleprompter software only — not smart glasses. Not affiliated with Meta, Ray-Ban, XREAL, Viture, or any glasses manufacturer. Free core forever; Spector Pro is **$34 once** (longer on-device history + copy script with stats). Cloud sync is **not shipped**.

---

## What we have done

### Product & UX (shipped in code)

| Area | Status | Details |
|------|--------|---------|
| **Script library** | Done | `localStorage` persistence, save/load, file upload on landing |
| **Adaptive pacing** | Done | Hybrid chunking, `getMs()` by mode/speed/punctuation |
| **Comfort spatial** | Done | Kalman filtering, breathing/drift in Comfort mode, haptics |
| **Player modes** | Done | Comfort / Focus / Presentation + Slow/Normal/Fast |
| **Customization** | Done | Text size, leading, Compact HUD toggle |
| **Mirror mode** | Done | Toggle for camera/mirror-facing setups |
| **Cue markers** | Done | `**emphasis**`, `[pause]`, `[pause:3s]`, `## Section` inline syntax; landing insert toolbar |
| **Rehearsal analytics** | Done | End-screen pacing %, hesitations, slowest chunk |
| **Rehearsal analytics v2** | Done | Pacing trend chart across recent runs on the landing history list |
| **Section bookmarks** | Done | `## Section` lines become chapter-marker chunks + a jump bar in the player |
| **PWA / offline** | Done | `manifest.json`, `sw.js` (see current cache version in file); offline shell implemented — re-run verifier to confirm |
| **iOS motion fix** | Done | `ensureMotionForPlayback()` skips motion setup when already bound |
| **Current positioning** | Done | Homepage lead: “Your punctuation sets the pace — not your voice”; no mic / no cloud; honest device matrix |
| **Modular core** | Done | `window.SpectorCore` — chunk registry, hooks, `createMotion()` |
| **First-run coach + hardware legend** | Done | One-time toast; `.glasses-hw-legend` under modes (tester/debug context) |
| **Beta assets** | Done | Landing beta signup + README Beta Program focused on hardware testing |
| **End-screen reinforcement** | Done | Subtitle and analytics note after a run |
| **Actionable beta + presets** | Done | Mailto beta form with glasses model field; sample scripts / presets |
| **History clarity** | Done | Local history; cloud sync called out as not shipped |
| **Monetization (current)** | Done | Free core; Pro $34 once via Paddle — 50 rehearsals on-device (vs 5) + copy script with stats; no subscription |
| **Export (Pro)** | Done | End-screen “Copy script + stats” gated behind Pro |
| **Say (AAC composer)** | Done (v1) | New page at `/say` — row-column switch-scan speller, single input (tap/Space/B), no camera/translation/backend. See "Accessibility & communication direction" below |

### Infrastructure & quality

| Area | Status | Details |
|------|--------|---------|
| **Static hosting** | Done | `vercel.json` → `public/` output directory |
| **Canonical assets** | Done | Single `public/style.css` (no `styles.css` split) |
| **Verification** | Harness present — requires re-run | `tests/run_verification.py` is the single entry point; do not treat older “all pass” notes as current evidence |
| **GitHub** | Done | Public repo; Vercel deploy from `main` |
| **Git identity** | Done | Commit attribution configured |

### Competitive context (vs Meta teleprompter)

Meta’s built-in path (where available) is paste + manual advance. SPECTOR differentiates with local script library, punctuation-aware auto-pace, Comfort spatial, cue markers, rehearsal analytics, and installable PWA — without a Meta account.

This is **competitive context**, not a claim that SPECTOR currently runs on Ray-Ban Meta Display.

**Device coverage (current reality — matches homepage / README):**

| Device | Status today |
|--------|----------------|
| Phone or computer | Full teleprompter in the browser |
| XREAL / Viture | Eyes-up via mirrored phone/computer display |
| Ray-Ban Meta Gen 1 / 2 | No display — phone rehearsal |
| Ray-Ban Meta Display | **Not** an on-lens SPECTOR runtime yet — phone rehearsal works today |

Not Ray-Ban exclusive. Web + PWA maximizes honest compatibility. Claim only what has been tested.

---

## Deployment status

**Last checked (historical):** June 24, 2026 — site responded HTTP 200 on Vercel; GitHub → Vercel auto-deploy was connected. This section is **not** a fresh verification pass.

**Live:** https://spectorlabs.io / https://www.spectorlabs.io

Re-run `python3 tests/run_verification.py` (and spot-check production) before treating deploy/offline health as current.

---

## Plan moving forward

### Phase 1 — Validate on real hardware (ongoing)

- [x] **Redeploy Vercel** to latest `main` (historical)
- [x] **Domain live** — spectorlabs.io acquired and serving the product site
- [x] **Positioning / homepage honesty pass** — punctuation-paced lead, device matrix, free core / Pro once (see `docs/BRAND.md`)
- [ ] **Beta test on real glasses** via Developer Mode ([TESTING.md](./TESTING.md)) — especially XREAL / Viture mirror workflows
- [ ] **Gather feedback** on Comfort, pacing feel, and comparison to other teleprompters (including Meta’s where users have it)
- [ ] **Re-run full local verification** and record the result here when green

### Phase 2 — Creator essentials (remaining)

Shipped since earlier drafts (do not re-list as open): mirror mode (base), section bookmarks, rehearsal analytics v2 / trend chart, Pro export of script + stats, basic cue insert toolbar on landing.

Still open:

- [ ] **Cue authoring UX polish** — deeper editor ergonomics beyond the basic insert toolbar (README still calls this out)
- [ ] **Analytics depth** — richer rehearsal insight beyond end-screen + trend chart, as evidence warrants
- [ ] **Mirror mode polish** — optional refinements (e.g. flip text only / preserve controls) if testers need them

### Phase 3 — Broader smart-glasses adoption

- [ ] **Onboarding flow** — first-run tour (“rehearse on phone → mirror for eyes-up”)
- [ ] **Preset scripts** — expand demo scripts for instant wow
- [ ] **Hardware controls map** — only where events actually forward; never claim unsupported Meta Display / Neural Band APIs
- [ ] **Landing / demo material** — keep proof honest (real player, real device claims)

### Phase 4 — Future platforms (research / optional)

Not current product positioning:

- [ ] **Port `SpectorCore`** to a glasses SDK / native wrapper **if/when** a real platform path opens (Meta or otherwise)
- [ ] **One-tap “Send to glasses”** from script library (requires real platform primitives)
- [ ] **Optional cloud sync** — **not shipped**; only if architecture and privacy story deliberately change
- [ ] **Plugin marketplace** — third-party chunk strategies, etc. (speculative)

### Accessibility & communication direction

A broader mission thread alongside rehearsal: Spector's display + single-input
engine is also a communication tool for people who are non-verbal or Deaf.
Two distinct efforts, deliberately not conflated:

- **Say (shipped, v1):** `/say` — spell a message via row-column switch
  scanning (a single tap/key/assistive-switch input), then show it large for
  someone else to read. No camera, no translation, no backend — fits the
  existing zero-dependency static-PWA architecture exactly. Untested with
  real AAC users yet; next step is real-world feedback, not more features.
- **Live translated captions (not started — needs its own plan):** wearer in
  a foreign country sees the other person's speech live-translated as
  captions. This is a different category of build, not an incremental
  feature: continuous mic capture + real-time speech recognition (spotty on
  Safari/iOS, usually needs connectivity), machine translation (a paid API —
  meaning a backend proxy, which breaks the current no-server architecture),
  and likely camera + face-tracking to position captions near the speaker's
  face. It also changes the privacy story — today's promise is "your own
  script, never uploaded"; this would mean capturing a *third party's*
  voice, a different consent question. Needs a deliberate architecture
  decision (new backend? separate sister app?) before any code — not yet
  scheduled into a phase above.

### Explicit non-goals (for now)

- Native App Store / Play Store binaries  
- Server backend or user accounts (until a deliberate plan requires it, or until the
  live-translation direction above gets a real plan)
- Direct Bluetooth / Neural Band proprietary protocols (unavailable / unsupported today)
- Claiming Ray-Ban Meta Display as an on-lens SPECTOR runtime
- Video recording / multi-device director mode  

### Strategic / Meta angle (future context only)

- **Real glasses testing:** Recruit XREAL / Viture / phone users first; Meta Display owners for **phone rehearsal** feedback and competitive comparison — not as proof of on-lens SPECTOR support.
- **Meta as platform option:** If Meta opens primitives (HUD rendering, button events, app distribution), re-evaluate a native/port path. Until then, Meta is competitor + research horizon, not the homepage story.
- **Adoption:** Track via future anonymous events or manual signals (samples used, Comfort tried, end reached, beta signups). Prefer evidence over speculation.

---

## Technical reference

```
SPECTOR/
├── public/
│   ├── index.html      # Landing, script library, positioning
│   ├── app.html        # Player + SpectorCore + ?test harness
│   ├── say.html        # Switch-scan AAC composer + ?test harness
│   ├── style.css       # Canonical styles (landing + glasses mode)
│   ├── manifest.json   # PWA manifest
│   ├── sw.js           # Service worker (cache version: see file; currently spector-v12)
│   └── sw-prime.html   # SW registration helper
├── tests/
│   └── run_verification.py
├── vercel.json         # { "outputDirectory": "public" }
├── TESTING.md          # Real glasses Developer Mode guide
├── SECURITY.md         # Vulnerability reporting + local self-audit guide
└── docs/PROJECT.md     # This file
```

**Run verification locally:**

```bash
python3 tests/run_verification.py
```

Expect `ALL VERIFICATION STEPS PASS` only after a fresh green run — do not assume from older notes.

**Run unit tests in browser:**

```
https://spectorlabs.io/app.html?test
```
(Should show `SpectorTest: ALL PASS` when the harness and deploy are healthy.)

---

## Cue marker syntax (quick reference)

| Syntax | Effect |
|--------|--------|
| `**word or phrase**` | Visual emphasis + slightly longer hold |
| `[pause]` | Inserts a ~2.8s pause chunk |
| `[pause:3s]` | Inserts a 3-second pause chunk |
| `## Section Name` | Section header — jump button in the player |

---

## Contact & links

- **GitHub:** https://github.com/hydrogenbondss/SPECTOR (public)
- **Live:** https://www.spectorlabs.io
- **Competition (context):** Meta Ray-Ban teleprompter (in-app, paste + manual advance) — not a claim of SPECTOR on-lens Meta Display support
- **Note:** SPECTOR sells teleprompter software only — not smart glasses or Meta hardware
- **Domain status:** spectorlabs.io purchased and live at https://www.spectorlabs.io/. Repo public at `github.com/hydrogenbondss/SPECTOR`.

---

*This document should be updated after each major release or deployment verification.*
