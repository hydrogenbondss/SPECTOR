# CORS Security Report

## Status: PASS

## Findings

No `Access-Control-Allow-Origin` configuration. Static site does not expose a CORS API. Browser same-origin policy applies to SPECTOR origins; third-party calls go to Formspree/GitHub/Paddle (their CORS).

No wildcard origin + credentials combination.

## What's at risk

N/A for misconfigured SPECTOR CORS.

## What's already secure

No CORS headers to mis-set.

## Recommendations

If APIs are added, use an explicit origin allowlist (`https://www.spectorlabs.io`, `https://spectorlabs.io`).
