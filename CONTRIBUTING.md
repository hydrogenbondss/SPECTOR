# Contributing to Spector

Thank you for your interest in contributing to Spector!

## Code of Conduct

Be respectful, inclusive, and focused on building a great tool for people who rehearse on smart glasses.

## How to Contribute

1. **Fork the repo** at [github.com/hydrogenbondss/SPECTOR](https://github.com/hydrogenbondss/SPECTOR) to your own account.
2. **Create a branch** for your changes: `git checkout -b feature/your-feature-name`
3. **Make your changes**:
   - Follow the existing code style (vanilla JS, minimal dependencies, clean HTML/CSS).
   - For UI changes, test on both desktop and mobile.
   - For player features that *might* relate to hardware controls (e.g. right-temple advance): exercise the **in-app simulator** (`app.html?debug`, `b` key) and document **expected** real-hardware behavior. Simulator success does **not** mean hardware behavior is verified — real glasses behavior is still unproven in-repo (see TESTING.md).
4. **Test**:
   - Run `cd public; python -m http.server 8000` (or `--directory public 8080`)
   - In your browser, open http://localhost:8000 (or http://127.0.0.1:8000 if IPv6 localhost doesn't resolve). The terminal only shows the server banner — the site appears in the browser.
   - Smoke-test the landing, player launch (samples then Launch), Comfort mode on phone or via DevTools → Sensors → Orientation on desktop, and the button simulator (`b` / on-screen control).
   - **PWA / offline (authoritative):** in a **real browser**, warm the app so the Service Worker can install, then enable Chrome DevTools **Offline** and confirm `app.html` still reloads. This is the offline regression check we trust.
   - **Do not** treat headless Chrome Service Worker diagnostics as an acceptance test — they may hang with the page left pending and are **not** evidence that the PWA is broken or healthy.
   - Run `app.html?test` in the player to verify core logic still passes (`SpectorTest`).
   - Optional: `python3 tests/run_verification.py` for broader harness checks — useful signal, but headless SW hangs must not drive Service Worker changes by themselves. Prefer [TESTING.md](TESTING.md) for the offline/PWA truth table.
5. **Commit** with clear messages.
6. **Open a Pull Request** against the `main` branch of `hydrogenbondss/SPECTOR`.

## Reporting Issues

- Use the GitHub Issues tab.
- For hardware-specific issues (right-temple button on Ray-Ban Meta, HUD readability, Meta Web App open, etc.), please include:
  - Your exact glasses model
  - What you were testing (e.g., "button advance during Comfort mode")
  - Whether you used the **simulator** or **physical hardware**
  - Steps to reproduce
  - Screenshots or screen recordings if possible
- Do not assume temple-button, HUD, or on-lens Display behavior is already verified — report what you observed.
- For security vulnerabilities, don't open a public issue — see [SECURITY.md](SECURITY.md).

## Development Notes

- The site is a static PWA (served from `public/`).
- All logic is in `public/index.html` and `public/app.html` (plus `say.html` for the AAC composer).
- Core engine (`SpectorCore`) is exposed on `window` for portability.
- Prefer calm, precise UI craft (see `docs/BRAND.md`) — avoid glassmorphism / purple-glow / Inter defaults.
- New features should consider phone rehearsal today and **possible** future glasses HUD use — without claiming unverified hardware support.
- Before a release, consider a local security self-audit — see [SECURITY.md](SECURITY.md).
- Hardware / glasses validation status lives in [TESTING.md](TESTING.md). Do not modify `public/sw.js` based solely on headless hangs.

## Open source approach

The full source is MIT-licensed and public. The "idea" (a better rehearsal tool for smart glasses) is visible to anyone. What creates lasting advantage is rapid iteration, real hardware validation with beta users, the brand + domain, the curated beta community, and shipping a polished experience that feels magical on actual devices. We welcome contributions and feedback while moving fast on the reference implementation. Focus on execution and community beats trying to hide code.

## License

MIT — see [LICENSE](LICENSE).

Thanks for helping make rehearsal better on smart glasses!
