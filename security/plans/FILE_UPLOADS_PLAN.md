# FILE_UPLOADS Fix Plan

## Changes

- `public/index.html` — `loadScriptFile` validation (type/size/control bytes)

## Verification goals

- [x] Oversized / non-text files rejected in client logic
- [x] No server upload path exists

## Manual verification (for the human)

- Drop a >200KB file on Try it — expect alert
- Drop a normal `.txt` — loads into textarea
