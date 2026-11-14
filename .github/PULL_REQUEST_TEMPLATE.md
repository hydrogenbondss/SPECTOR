## Summary

<!-- What does this change and why? One or two sentences. -->

## Checklist

- [ ] `python3 tests/run_verification.py` passes locally (ends with `ALL VERIFICATION STEPS PASS`)
- [ ] `public/app.html?test` reports `SpectorTest: ALL PASS` (required if `public/spector-core.js` or player logic changed)
- [ ] No new dependencies added — the site is a zero-runtime-dependency static build
- [ ] Service worker cache version bumped in `public/sw.js` (`spector-vN`) if shipped assets changed
- [ ] Docs updated (README / `docs/` / TESTING.md) if behavior or structure changed
