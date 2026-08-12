# SPECTOR Hardware Beta — Operator Runbook

First-version beta system for collecting **real hardware evidence**.

Public signup stays on the homepage (`#beta`). Tracking and feedback stay **private**. Do not put tester PII in git.

---

## Evidence levels (use these labels everywhere)

| Label | Meaning | May become a site claim? |
|-------|---------|--------------------------|
| **Verified** | Reproduced by SPECTOR operators, or confirmed with enough independent tester evidence that you are willing to update `TESTING.md` / product copy | **Only after** you deliberately update official docs |
| **Tester-reported** | One or more beta testers described this; not yet promoted to official verification | No |
| **Unverified** | Expected / hypothesized / unknown — including anything not tested on real hardware | No |

Never upgrade **tester-reported** or **unverified** to marketing claims without a conscious doc update.

---

## Tester-facing private beta page

Accepted testers can open:

`https://www.spectorlabs.io/beta/test?tester=SB-YYYYMMDD-NNN`

- Not linked from main nav.
- Loads **non-PII** data from `public/beta/testers-registry.json` (id, device label, status, protocol). **No emails.**
- Checklist + feedback UI live in `public/beta-test.html`.
- Official status remains **operator-controlled** in `private/beta-testers.csv`. The page displays status; testers cannot change it.
- Feedback storage today: **localStorage on the tester’s device** + JSON download + optional **mailto draft** to hello@ (user must send). Remote DB is **not** configured (`SpectorBetaFeedback` / `SPECTOR_BETA_REMOTE_SUBMIT` stub).

### Sync when you invite someone

1. Keep PII only in `private/beta-testers.csv`.
2. Add/update a matching row in `public/beta/testers-registry.json` with **id, deviceFamily, deviceLabel, status, protocol** only.
3. Send them the `/beta/test?tester=…` link manually.

### Security limitations (honest)

- Tester IDs are **shared secrets**, not strong authentication. Sequential IDs can be guessed.
- Anyone with a valid ID can view that registry row and submit feedback **as** that ID.
- Do not put emails, names, or private notes in the public registry.
- There is **no** `/beta/admin` dashboard (would be public and insecure without auth).

---

## How applications arrive

| Step | What happens |
|------|----------------|
| 1 | Tester uses homepage **Hardware beta** (`https://www.spectorlabs.io/#beta`) |
| 2 | Fields: email, glasses model, optional notes (`form=hardware-beta`) |
| 3 | Ideally Formspree → `hello@spectorlabs.io`; if that fails, mailto subject **Spector Beta Request** |
| 4 | **You** add a row to `private/beta-testers.csv` |

There is no SPECTOR database. Formspree debugging is out of scope for this runbook.

---

## Statuses

| Status | Meaning | Your action |
|--------|---------|-------------|
| **Applied** | Application recorded; not contacted | Wait until you have the right checklist ready |
| **Accepted** | Invited; protocol sent | Send checklist + feedback template by hand |
| **Testing** | Tester is running the protocol | Wait for feedback; answer questions |
| **Feedback Received** | Written feedback in hand | File under `private/feedback/` |
| **Completed** | Reviewed; evidence classified; follow-up done | Update notes; only then consider official claims |

Progression: Applied → Accepted → Testing → Feedback Received → Completed.

---

## Operator workflow

### A. Add a new tester

1. Open `private/beta-testers.csv` (create from [`templates/beta-testers.csv`](./templates/beta-testers.csv) if missing).
2. Append a row:
   - `tester_id`: `SB-YYYYMMDD-NNN` (e.g. `SB-20260812-002`)
   - `name`, `email`, `country` if known
   - `glasses_platform` / `exact_model` from their message
   - `form`: `hardware-beta` (or `mailto-fallback` if that path was used)
   - `signup_date`: today
   - `status`: **Applied**
3. Never commit `private/`.

### B. Move between statuses

Edit the `status` cell in `private/beta-testers.csv`. Update `last_contacted` (ISO date) when you email them. Update `notes` with a short log.

### C. Accept a tester and start testing

1. Pick the checklist for their hardware (see below).
2. Copy [`templates/beta-feedback.md`](./templates/beta-feedback.md) to  
   `private/feedback/<tester_id>.md` and fill the header.
3. Email them **manually** (no automation): short intro + checklist + ask them to reply using the feedback headings.
4. Set status → **Accepted**, then **Testing** when they confirm they started.

### D. Record feedback

1. Paste their reply into `private/feedback/<tester_id>.md` (or fill the template fields yourself).
2. Mark each finding as **tester-reported** unless you personally verified it.
3. Set CSV `feedback_received` to `yes` and status → **Feedback Received**.
4. After you review and classify evidence → **Completed**.

---

## Hardware checklists (send the right one)

| Hardware | Product honesty | Checklist |
|----------|-----------------|-----------|
| Ray-Ban Meta **Gen 1 / Gen 2** | **Phone rehearsal only.** SPECTOR does **not** claim on-lens display on these devices. | [`templates/checklist-rayban-meta-gen.md`](./templates/checklist-rayban-meta-gen.md) |
| Ray-Ban Meta **Display** | On-lens SPECTOR is **unverified**. Report open/display failures honestly. | [`templates/checklist-rayban-meta-display.md`](./templates/checklist-rayban-meta-display.md) |
| **XREAL / Viture** | Eyes-up via **mirroring** phone/computer — not a native glasses app. | [`templates/checklist-xreal-viture.md`](./templates/checklist-xreal-viture.md) |

Feedback form for all devices: [`templates/beta-feedback.md`](./templates/beta-feedback.md).

---

## What to do with Mirko first (Ray-Ban Meta Gen 1)

Already in `private/beta-testers.csv` as **Applied** (`SB-20260812-001`).

Public registry entry (no email): `public/beta/testers-registry.json`.

Tester link (when you choose to share it):

`https://www.spectorlabs.io/beta/test?tester=SB-20260812-001`

1. Confirm you want him in the first wave (Gen 1 = **phone rehearsal** protocol only).
2. Feedback sheet: `private/feedback/SB-20260812-001.md`.
3. When ready to contact (**manual email only**):
   - Thank him for volunteering.
   - State clearly: Gen 1 testing is **phone rehearsal while wearing the glasses** — not on-lens SPECTOR text.
   - Send the tester link above (and optionally the Gen checklist).
4. Set private CSV status **Accepted**, set `last_contacted`, and update `status` in `testers-registry.json` to match.
5. When he starts → **Testing**; when feedback arrives → **Feedback Received** → review → **Completed**.

Do **not** claim Gen 1 on-lens display in any reply or in site copy.
Do **not** send mail automatically from the site.

---

## Reddit path (short)

Volunteer → `#beta` form → you add CSV row (**Applied**) → manual invite + checklist (**Accepted**) → test (**Testing**) → feedback file (**Feedback Received**) → classify evidence (**Completed**) → only **verified** items may update `TESTING.md` / product claims.

---

## Related

- Tracker template: [`templates/beta-testers.csv`](./templates/beta-testers.csv)
- Product verification notes: [`TESTING.md`](../TESTING.md)
- Homepage form: `public/index.html` `#beta`
