# CSRF Security Report

## Status: PASS

## Findings

- No session cookies set by SPECTOR.
- State changes are local (`localStorage`) or third-party Formspree POSTs.
- Formspree forms use `fetch` with FormData to a fixed action URL; Formspree enforces its own form endpoint auth.
- Mailto fallback opens a local mail client (user must send).

No cross-site cookie session to forge.

## What's at risk

Cross-site page could theoretically trigger Formspree submit from a victim browser if they keep the page open — Formspree + client 60s rate limit reduce abuse. Residual LOW spam risk accepted.

## What's already secure

Cookieless architecture eliminates classic CSRF against SPECTOR sessions.

## Recommendations

If cookies/sessions are added, set SameSite=Lax/Strict and CSRF tokens.
