# AUTH_MIDDLEWARE Security Report

## Status: N/A

## Findings

No login, sessions, cookies, JWT, or auth middleware. All routes are static HTML served from `public/` via Vercel.

### Exhaustive public routes (rewrites + files)

| Route | Auth required? |
|-------|----------------|
| `/`, `/index.html` | No (public marketing + forms) |
| `/app.html` | No (player; local script only) |
| `/say`, `/say.html` | No |
| `/pricing`, `/terms`, `/privacy`, `/refund` | No |
| `/teleprompter-for-*`, `/ray-ban-meta-teleprompter` | No |
| `/beta/test` → `/beta-test.html` | No server auth — tester ID is a shared secret (see ACCESS_CONTROL) |
| `/beta/testers-registry.json` | Public static JSON |
| `/js/*`, CSS, images, `sw.js` | Public |

No API routes return user data from a server.

## What's at risk

N/A for classic auth middleware failures. Residual risk is unauthenticated static assets (by design) and beta shared-secret model.

## What's already secure

No accidental "authenticated" data endpoint without middleware — there is no authenticated surface.

## Recommendations

1. Do not add `/beta/admin` without real auth.
2. If Pro entitlement moves server-side, put auth middleware before handlers.
