# SECURITY_HEADERS Fix Plan

## Changes

- `vercel.json` — add `Strict-Transport-Security` and `X-Frame-Options: SAMEORIGIN`

## Verification goals

- [x] All five checklist headers present in `vercel.json`
- [x] Headers configured once globally on `/(.*)`

## Manual verification (for the human)

After deploy:
```bash
curl -sI https://www.spectorlabs.io/ | rg -i 'strict-transport|x-frame|x-content-type|referrer-policy|content-security-policy'
```
