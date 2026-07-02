---
name: brand-asset
description: Generate on-brand Spector marketing images (Instagram square/portrait, OG card, avatars) as self-contained HTML rendered by headless Chromium. Use whenever a social post, OG image, or promo graphic is needed. Takes a format + the message, e.g. "ig-square — voice control is here".
---

# Spector brand-asset factory

Build a self-contained HTML file in the scratchpad, render it with headless
Chromium at the exact target size, view the PNG to verify, then deliver via
`SendUserFile`.

## Brand rules (non-negotiable)

- **Logo:** always the real file `public/images/logo-mark.png` (purple aperture).
  NEVER draw a substitute mark with CSS — it was caught immediately last time.
- **Palette:** canvas radial `#1c1430 → #0b0a12 → #060608`; text `#F4F4F6`
  (soft white — never pure `#FFF`); muted `#A1A1AA`; dim labels `#85858E`;
  accent `#7C3AED`; light accent / emphasis `#A78BFA`.
- **Type:** Inter via Google Fonts (`wght@400;500;600;700`); headline ~56–64px
  weight 600, tight letter-spacing; labels uppercase, letterspaced, dim.
- **The signature look = the player itself:** dimmed context lines
  (opacity ~0.16) above and below one glowing active line
  (`text-shadow: 0 0 46px rgba(124,58,237,0.45)`), purple **emphasis** word with
  underline (`#A78BFA`, underline `rgba(167,139,250,0.5)`, offset), a slim
  progress bar (`linear-gradient(90deg,#7C3AED,#A78BFA)`, ~38% filled), and an
  uppercase `auto-pacing · punctuation-aware` label. One ambient purple radial
  glow behind the active line — never tint everything purple.
- Footer line: `spectorlabs.io`. Voice: honest, plain, no hype adjectives.

## Formats

| Preset | Size | Use |
|---|---|---|
| `ig-square` | 1080×1080 | Instagram feed |
| `ig-portrait` | 1080×1350 | Instagram 4:5 (screenshots of the real player) |
| `og-card` | 1200×630 | Social share / OG image |
| `avatar` | 144×144 | Profile pictures (2× for 72px display) |

**Design natively for the target size.** Cropping a 16:9 composition to square
cuts the headline off — rebuild the layout instead.

## Rendering (the reliable recipe)

Plain `chrome --screenshot` **fails** here two ways: `--virtual-time-budget`
doesn't wait for image decodes (big JPEGs render as a top-band smear), and the
viewport often leaves a white strip at the bottom. Use CDP:

1. Write the HTML to the scratchpad. Set
   `html,body{margin:0;height:<H>px;overflow:hidden;background:#060608}`.
2. Launch: `<chromium> --headless=new --remote-debugging-port=9224 --no-sandbox
   --disable-gpu --hide-scrollbars --window-size=<W>,<H> about:blank &` (binary:
   `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`), sleep ~2.5s.
3. Node script (built-in `WebSocket`, no deps): fetch `http://127.0.0.1:9224/json`
   → connect to the page's `webSocketDebuggerUrl` → `Page.enable` →
   `Emulation.setDeviceMetricsOverride {width,height,deviceScaleFactor:1}` →
   `Page.navigate` → **real** `setTimeout` wait (4s; longer for big images) →
   `Page.captureScreenshot {format:'png', clip:{x:0,y:0,width:W,height:H,scale:1}}`
   → write base64 to file.
4. **View the PNG** (Read tool) before delivering — check nothing is clipped,
   the logo is the real one, text isn't mid-animation.
5. Deliver with `SendUserFile`.

## Capturing the real app (for `ig-portrait` product shots)

Serve `public/` locally, open `app.html` at 540×675 with
`--force-device-scale-factor=2` (→ 1080×1350). Then via `Runtime.evaluate`:
remove `.first-run-toast`, and **pin a good line instead of running playback**
(screenshots race the chunk fade otherwise):
```js
const i = chunks.findIndex(c => /Emphasis/.test(c));
if (i >= 0) { currentIndex = i; updateDisplay(); }
```
Wait ~1.4s for the settle, then capture. The "**Emphasis** earns a hold." line
from the built-in sample is the proven money shot.

## Photo crops (`avatar`)

The sandbox ffmpeg has no JPEG decoder/encoder — do photo crops in Chromium too:
an HTML page with `img{width:144px;height:144px;object-fit:cover;object-position:50% 38%}`
(38% biases toward faces), rendered with the CDP recipe above and a generous wait
for the source image to decode.
