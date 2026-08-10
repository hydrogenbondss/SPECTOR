# Spector Testing Guide

How to exercise Spector on phone/desktop and (when you have hardware) on smart glasses.

**Read this first:** most of this file is a **manual procedure** or a description of **expected / intended behavior**. It is **not** a claim that every path has been verified on real glasses. See **Current verification status** below.

The web/PWA player is usable today for phone and computer rehearsal — no signup required. Real Ray-Ban Meta / HUD / temple-button behavior is still **hardware-dependent and unverified** in-repo.

---

## Current verification status

### 1. Verified behavior

| Fact | How verified |
|------|----------------|
| `public/sw.js` is served successfully | HTTP **200** |
| `public/sw.js` syntax | `node --check` passes |
| Shipped Service Worker shape | Contains `install` / `activate` / `fetch` handlers, cache population, `skipWaiting()`, and `clients.claim()` |
| Player offline reload | **Real-browser** Chrome DevTools **Offline**: `app.html` reloads while Offline; expected caches populate |

**Authoritative offline regression check:** Chrome DevTools **Offline** in a **real browser**, after a warm visit so the Service Worker can install and cache. This is the offline check we trust.

**Headless Chrome is non-authoritative:** Service Worker diagnostics in headless Chrome repeatedly hang with the page left **pending**. Those hangs are **NOT** evidence that the PWA is broken. They must **NOT** be presented as a passing or failing acceptance test. Do **not** change `public/sw.js` based on headless hangs alone.

### 2. Manual procedure / expected behavior (not proof)

The sections below (Developer Mode, Meta Web App, phone player steps, simulator) describe **how to try things** and what we **expect**. They are **not** verification that hardware paths already work.

- Developer Mode instructions = procedure only, not proof of successful hardware behavior.
- Meta Web App instructions = procedure only, not proof that install/open on glasses has been verified.
- `app.html?debug` / `b` key = **in-app simulator** behavior only.

### 3. Unverified / hardware-dependent

These remain **open**. Do not claim them as verified:

- Comfort on **actual Meta glasses** — NOT verified
- Real **right-temple** button / touchpad behavior — NOT verified
- **HUD readability / comfort** on an actual glasses lens — NOT verified
- **Meta Web App** installation / opening flow on actual glasses — NOT verified
- AAC (`/say`) / broader beta feedback — NOT yet gathered
- Trademark outcome; marketing-page offline CSS cosmetics (`*.min.css` vs SW precache) — still open

**Product honesty (aligned with the live site):** Ray-Ban Meta Gen 1/2 are a **phone-rehearsal** path. Spector does **not** claim verified on-lens Meta Display / HUD operation. XREAL / Viture eyes-up is via **mirroring** the phone/computer display — treat real-device comfort as tester feedback until recorded as verified.

---

## 1. Enable Developer Mode on Your Glasses

> **Manual procedure — not verified.** Following these steps does not mean Spector has proven the flow on actual glasses.

1. Open the **Meta AI app** on your phone.
2. Go to your profile → tap the **Meta AI app version number** at the bottom **5 times**.
3. A hidden toggle called **Developer Mode** will appear. Turn it **on**.

If these UI steps have moved in a newer Meta AI app, treat that as part of your bug report (app version + screenshots).

---

## 2. Open Spector on Your Glasses (manual procedure)

> **Manual procedure — not verified.** This does **not** imply the Meta Web App install/open flow has been verified on actual glasses. Phone/browser rehearsal does **not** require these steps.

1. Make sure your Ray-Ban Meta glasses are connected and awake.
2. On your phone, open the **Meta AI app**.
3. Go to **Settings → App connections → Add a Web App**.
4. Paste this URL:

   **https://www.spectorlabs.io**

5. **Expected (unverified on hardware):** Spector may open in a glasses Web App / companion surface depending on model and Meta platform support. If it does not, rehearse on the phone browser/PWA and report the exact model + what failed.

---

## 3. How to Use Spector (phone / computer)

These steps apply to a normal browser or installed PWA on phone or computer:

- Paste or upload your script on the landing page (or use **Try Spector free** / a sample).
- Tap **Launch teleprompter** / open the player.
- **Comfort mode (expected behavior on phone/desktop sensors):** subtle breathing + gentle spatial movement when device orientation is available. On desktop without sensors, use DevTools → Sensors → Orientation, or `app.html?debug` tilt controls. **Comfort on actual Meta glasses is NOT verified.**
- **Focus mode:** static, steady center read — maximum stability.
- **Presentation mode:** slower / heavier type for delivery.
- Speeds: Slow / Normal / Fast; adjust text size and leading as needed.
- Tap the screen or press play (Space / K) to start/stop; R rewinds three chunks.
- When finished, the end screen shows rehearsal stats (chunks, time, pacing, etc.).

### Glasses-related notes (expected / intended — NOT hardware-verified)

- **Non-Display Ray-Ban Meta (Gen 1/2):** intended use is **phone companion rehearsal**. Do not assume an on-lens teleprompter.
- **Ray-Ban Meta Display / HUD:** on-lens Spector is **NOT verified**. Do not claim Display/HUD operation is verified. Phone rehearsal works today.
- **XREAL / Viture / similar:** intended eyes-up path is **mirroring** the phone or computer display. Controls depend on the hardware; real-device validation is still tester-driven.
- **Right-temple / touch / Neural Band:** **NOT verified** on hardware. Do not claim button/touch behavior is verified. Where a platform forwards events, advance/pause *may* work — that is a hypothesis for beta reports, not a shipped guarantee.

### Desktop / in-app simulator only

Open the player with **`app.html?debug`** for tester scaffolding (button simulator, tilt sliders, hardware legend — hidden for regular users). Press **`b`** (or the on-screen simulate control) to mimic a temple-button **advance**.

**Important:** the simulator and `b` key prove the **in-page advance path** only. They do **not** prove that a physical right-temple button or touchpad on Ray-Ban Meta works the same way.

---

## Hardware Testing Focus (beta — gather evidence)

Please test and report (these are **questions for verification**, not claims of current support):

- Does Spector open at all via Meta Web App on your exact model? If not, what happens?
- **Right-temple physical button / touchpad** (if present): single press advance? double-tap pause? usable while speaking?
- **HUD readability & Comfort** (if you have a display): text size/leading in the lens; does spatial breathing help or distract?
- **Comparison** (if you have Meta’s built-in teleprompter): how does Spector feel vs that path?
- **Simulator utility:** is `?debug` + `b` useful for desktop practice before hardware?

Sign up at https://www.spectorlabs.io (Hardware beta section) and mention your exact hardware. Source: https://github.com/hydrogenbondss/SPECTOR.

---

## 4. Known Limitations (Early Version)

- Spatial movement works best with moderate head movement (when sensors are available).
- Very long scripts may feel slower.
- Haptics only work if your device supports vibration.
- This remains a **web-based** experience (PWA), not a native Meta / glasses SDK app.
- Headless automated SW checks may hang with the page **pending** — use real-browser DevTools Offline checks instead (see verification status). Those hangs are non-authoritative and are not a PWA pass/fail.

---

## 5. Feedback

Useful reports still include:

- Comfort vs Focus on **phone** (sensors) vs **glasses** (if any)
- Whether any temple/touch events reach the page on your device
- HUD text readability for different script lengths / chunk sizes (when applicable)
- Whether you’d use this for real speeches; comparison to other teleprompters
- For non-Ray-Ban glasses (XREAL, Viture, etc.): which controls work in practice

---

**Current Live Version:** https://spectorlabs.io

Thank you for helping verify what still needs real hardware evidence.
