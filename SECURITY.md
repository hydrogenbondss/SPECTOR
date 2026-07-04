# Security Policy

## Scope

Spector is a static, client-side PWA (`public/index.html`, `app.html`,
`style.css`, `sw.js`). There's no account system, no database, and nothing
Spector controls stores your rehearsal data — it stays in `localStorage` on
your device. The only third-party surface is the beta-signup form (posts to
Formspree) and static hosting (Vercel). The attack surface today is
intentionally small; this will get updated as that changes.

## Reporting a Vulnerability

Email **hello@spectorlabs.io** with what you found and how to reproduce it.
Please don't open a public GitHub issue for an undisclosed vulnerability —
use email so it can be fixed before details are public. This is a solo
project, so response times are best-effort, but reports are taken seriously
and credited (if you'd like) once fixed.

## Self-auditing with Shannon

Before a release, you can run [Shannon](https://github.com/KeygraphHQ/shannon)
— an autonomous AI pentester CLI — against a local dev copy of Spector to
catch injection, XSS, SSRF, and auth/authz issues before they ship. It's an
external dev tool, not a dependency: it's AGPL-3.0-licensed and is never
bundled, imported, or shipped as part of the site.

Requirements: Docker, Node.js 18+, and your own AI provider API key (Anthropic
recommended) — supply the key as an env var when you run it; never commit it.

```bash
# 1. Serve a local copy of Spector
cd public && python -m http.server 8000

# 2. In another terminal, set up and run Shannon against it
npx @keygraph/shannon setup
npx @keygraph/shannon start -u http://localhost:8000 -r /path/to/SPECTOR
```

Point it only at a local/dev copy — it executes real exploit attempts, so
don't run it against `https://spectorlabs.io` directly. Treat anything it
finds like a normal vulnerability report: fix it, then note it in
[CHANGELOG.md](CHANGELOG.md) if it's user-facing.
