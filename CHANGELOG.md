# Changelog

What's shipped, in plain language — not a raw commit log (see the
[full commit history](https://github.com/hydrogenbondss/SPECTOR/commits/main)
on GitHub for exact diffs). Starts from the site's current stable form;
earlier scaffolding/redesign churn isn't itemized here.

Want to know when something new ships without checking back? **[Watch this
repo](https://github.com/hydrogenbondss/SPECTOR/subscription)** on GitHub
("Releases only" is enough) — that's the whole notification system for now.

---

## 2026-07-03

- Fixed a site-wide reliability bug: both the landing page and the player
  gated all interactivity behind `window.onload`, which waits on every
  sub-resource including the Google Fonts request — and that request hangs
  indefinitely for any visitor whose network or browser blocks it, silently
  leaving every button and form unresponsive. Now runs on `DOMContentLoaded`
  instead.
- Rewrote the homepage headline to lead with the actual job ("Talk to
  camera. Not to your notes.") instead of a competitive-attribute claim.
- Fixed two real bugs: custom pause durations (`[pause:Ns]`) were silently
  collapsed to a generic pause and never actually timed correctly; the
  **Bold** toolbar button's auto-select missed the word it was supposed to
  select, corrupting text typed over it.
- Fixed a wrong logo baked into two marketing images (a hexagon-outline
  stand-in instead of the real mark).
- Corrected a hardware-support claim that overstated readiness versus the
  site's own honest device matrix, and fixed two self-contradictions in the
  README.
- Published `BRANDING.md` — the project's branding and marketing plan.

## 2026-07-02

- Rebuilt the hero section into a live, real-engine demo (the actual pacing
  logic, cycling real lines) instead of a video.
- Added the honest, per-device compatibility matrix — what works today on
  which glasses, plainly stated — plus a founder note with a real photo.
- Added a "proof of life" badge (live GitHub star count, last-updated date).
- Privacy pass on public docs; added a "clear history" control for locally
  stored rehearsal data.
- Parked monetization setup with field notes for when it resumes.

## 2026-07-01

- Fixed a regression that had deleted most of the player's own stylesheet.
- Added the go-live playbook and cross-session player preference persistence.
- Added per-device SEO landing pages (XREAL, Viture, Ray-Ban Meta) and
  Google Search Console verification.
