# ACCESS_CONTROL Fix Plan

## Changes

- `public/beta/testers-registry.json` — remove `country`; update note about shared-secret IDs

## Verification goals

- [x] Public registry contains no country/name/email fields
- [x] Tester ID SB-20260812-001 still resolves for `/beta/test?tester=…`
- [x] Residual IDOR documented as MEDIUM accepted risk

## Manual verification (for the human)

- Open production `/beta/testers-registry.json` after deploy — confirm no `country`
- Open `/beta/test?tester=SB-20260812-001` — workspace loads
- Open `/beta/test?tester=SB-20990101-999` — unknown ID error
