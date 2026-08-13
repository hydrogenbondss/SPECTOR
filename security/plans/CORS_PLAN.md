# CORS Fix Plan

## Changes

- None

## Verification goals

- [x] No wildcard CORS on SPECTOR responses
- [x] No credentials+wildcard pairing

## Manual verification (for the human)

```bash
curl -sI https://www.spectorlabs.io/ | rg -i 'access-control' || echo 'no CORS headers (expected)'
```
