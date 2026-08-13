# XSS Security Report

## Status: PASS

## Findings

User/script content sinks reviewed:

| Sink | Mitigation |
|------|------------|
| `SpectorCore.formatChunkHtml` → `innerHTML` | Escapes `&<>` before cue spans |
| Library/history titles | `escapeHtml` via `textContent` |
| Beta protocol steps/checklist | **Added** `escapeHtml` before `innerHTML` |
| `app.html`/`say.html` `?test` output | **Changed** to `textContent` (no JSON-in-HTML) |
| Meta fields on beta page | `textContent` |

CSP still allows `'unsafe-inline'` (residual defense-in-depth gap, LOW).

## What's at risk

Crafted scripts in teleprompter text previously depended on escapeHtml correctness; formatChunkHtml tested in `?test` harness. Protocol strings are author-controlled but now escaped anyway.

## What's already secure

Core player escaping + tests for cue HTML.

## Recommendations

Longer-term CSP nonces; keep escaping on every `innerHTML` assignment.
