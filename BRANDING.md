# Spector — Branding & Marketing Plan

Synthesized from 10 parallel research streams (competitor brand identity in both
categories, indie brand-building case studies, content/creator/community/growth
marketing, messaging frameworks, visual-identity trends, naming/voice audit) plus
the earlier 10-agent posting-venue research. This is the one plan to work from —
it supersedes the standalone recommendations scattered across chat.

**The one-paragraph verdict:** keep the name, keep the palette, don't open a
Discord yet, fix the homepage headline, invest in exactly one ownable visual
signature, and spend distribution effort on existing communities + open app
platforms before chasing press or big-name creators.

---

## 1. Brand identity — what to keep, what to fix

### Keep as-is
- **The name "Spector."** It's a real outlier versus both categories (teleprompter
  software is almost all literal — Teleprompter.com, PromptSmart, Teleprompter
  Pro; glasses hardware names its models, not abstractions). Evocative names win
  on recall long-term, and "spec-" wordplay is proven territory — Snap's own
  glasses line is literally "Spectacles"/"Specs." The SEO cost of a non-literal
  name is real but small, and it's already neutralized by the per-device landing
  pages (`/teleprompter-for-xreal` etc.) — that's the correct architecture
  (brand carries recall, URLs carry keywords) and doesn't need to change.
- **The purple/near-black palette.** None of the five hardware competitors
  (Meta, Even Realities, RayNeo, XREAL, Viture) anchor on purple, and neither
  does any of the five teleprompter-software competitors (Teleprompter.com,
  BIGVU, PromptSmart, Speakflow, Teleprompter Pro all skew light-background
  corporate-SaaS with blue/orange/magenta accents) — purple is unclaimed in
  *both* categories Spector sits between. There's a second, sharper gap: every
  teleprompter competitor's product uses a dark near-black screen only for the
  transient in-use reading surface, then reverts to a light/corporate brand the
  moment you're not actively reading a script — **none of them commit to
  dark-and-minimal as the persistent brand identity** across site, logo, and
  product chrome. Spector doing so is real category differentiation, not just
  a style preference. Separately, 2026's "AI slop" backlash isn't really about
  the color — Linear owns purple and still reads premium. Don't touch the
  palette. (One caveat to carry into section on the ownable signature below:
  Inter is *already* used by two direct teleprompter competitors, BIGVU and
  Speakflow, so the typeface itself isn't a differentiator — the payoff has to
  come from a signature detail, not the font choice alone.)
- **The honest/transparent voice.** No incumbent in either category does this —
  competitor voice is uniformly confidence/superlative-driven (mission
  statements, spec-flexing, "quiet perfectionism"). An FAQ that names a Meta
  feature directly and answers straight matches the Patagonia/Buffer playbook
  (structured, intentional disclosure builds trust; raw over-confession doesn't).
  Real differentiator, low risk as currently executed.

**Add one thing to the voice: a single, permanent, falsifiable promise, stated
verbatim everywhere.** Bruno (the API-client OSS project) built its whole
trust position on one repeated line — "offline-only, no cloud-sync, ever" —
copy-pasted unchanged from its 2022 README through its current marketing.
Spector already has the ingredients (free core forever, no account, nothing
uploaded) but states them as loose feature bullets rather than one committed
promise. Pick the exact wording once (e.g. *"Free core, forever. No account,
no cloud, nothing uploaded — ever."*) and repeat it identically in the
README, the landing footer, and the FAQ, the same way Bruno does — a
one-time copy decision, not a project.

### One thing to actively manage
"Spector" has a **connotation risk, not a legal one**: SpectorSoft's "Spector
Pro"/"Spector 360" were well-known consumer spyware/keylogger products (the
company rebranded to Veriato in 2015 specifically to escape that reputation,
so no live trademark conflict). The risk is that smart glasses are *currently*
in a live surveillance-privacy news cycle (Meta Ray-Ban contractor-monitoring
lawsuit, EFF's "Think Twice" post, BBC covert-filming coverage) — a name that
phonetically reads as "spy" + "specter" (ghost/watching presence) sits close
enough to that narrative for a skeptical reader to draw an unflattering line,
even though the product does the opposite (a one-way display only the wearer
sees, nothing recorded or uploaded).

**Fix, cheap and copy-only:** lean into the *other* readings — spectacles,
spectator, on-stage presence — in first-touch copy, so "spy" isn't the default
association. The current tagline "Eyes Forward" already points toward
confidence/visibility rather than concealment; keep leaning that direction
rather than adding anything ghost/watching-themed to the brand (no eye/lens
motifs that read as surveillance, no "always watching" language anywhere,
including jokingly).

### The one thing to add: an ownable visual signature
Rationing purple and using hairline borders avoids looking generic — it doesn't
yet make Spector *recognizably itself*. The cheap, high-leverage fix used by
Raycast (`font-feature-settings: "ss03"` — one CSS line swaps Inter's alternate
single-story "g," applied everywhere) and Linear (motion as a typographic
device) is to pick **one detail, tied to the actual product, and apply it
everywhere:**

- Give the scrolling-text motion itself (Spector's actual core mechanic) one
  small, deliberate, signature treatment — not decoration, the real product
  surface — so it's recognizable in a screenshot or clip without a logo in
  frame. The hero demo card and the player's fade/glow treatment are the
  natural place to push this further and reuse identically everywhere (site,
  screenshots, social assets).
- Lock **one consistent screenshot/mockup template** (one device frame, one
  background treatment, one caption placement/font) and reuse it verbatim
  across the site, social posts, and any future store listings. This is the
  realistic, zero-budget substitute for a "photography system" — survey data
  says stock/generic imagery is rated worse than genuine low-budget screenshots,
  consistency is what makes it read as a system rather than one-off images.

---

## 2. Messaging fix

**The biggest gap, found independently by the messaging-frameworks research:**
the current headline leads with a *competitive attribute claim* —

> Hero badge: "One prompter · any glasses" / H1: "Eyes Forward." / Subhead:
> "...works on any smart glasses... not just one brand's."

— which only lands with a visitor who already knows they want a **smart-glasses
teleprompter**. It says nothing to the much larger pool of people who don't yet
know this category exists but do have the underlying problem: breaking eye
contact with the camera/audience to read notes.

**Recommended framework:** Jobs-to-be-Done, blended with April Dunford's
competitive-alternatives method (full StoryBrand doesn't fit; full Category
Design isn't actionable pre-traction — see below). Lead with the *job*, use the
cross-brand claim as supporting proof, not the headline.

**Alternative headline directions to test** (keep "Eyes Forward" as a
secondary line/badge if it's earned brand equity already — these replace it as
the primary hook):
- **"Talk to camera. Not to your notes."** — states the job directly.
- **"Never break eye contact again."** — same job, more visceral.
- **"Rehearse on your phone. Perform without looking down."** — job + mechanism,
  no jargon.

Keep the subhead's cross-brand + free/open-source claims — those are real
differentiators, just as the *second* thing a visitor learns, not the first.

**Minimum-viable category naming:** since full Category Design ("we're creating
smart-glasses rehearsal software") is premature at zero users, the free version
is just *consistency* — always call it the same thing ("a smart-glasses
teleprompter") in every FAQ, meta description, and post, rather than varying
the phrase. That alone compounds into category ownership over time at zero cost.

**Objection-handling, make it explicit:** Meta shipped its own native
teleprompter for Ray-Ban Display at CES 2026 (Jan 2026) — this is now the
single most likely objection ("doesn't Meta already do this?"). The FAQ already
has a version of this answer; keep it current and honest (Meta's is
manual-only and locked to the $799 Display; Spector is free, cross-brand,
adaptive-paced, and works on the far larger camera-only Ray-Ban Meta install
base today).

---

## 3. Distribution & community roadmap (merges both research batches)

### 🟢 Do now
- **GitHub Discussions, not Discord.** It's already enabled on the repo. Set up
  2–3 categories (Q&A/Support, Ideas, Show & Tell) and link to it from the
  README and every external post. A quiet Discussions tab doesn't read as
  "dead" the way an empty Discord does — it's a tab, not a room.
- **Turn the existing beta-signup form into a changelog/newsletter**, framed as
  "get notified when features ship," not "join our community." An async list
  never looks empty regardless of subscriber count.
- **Engage every first commenter personally**, 1:1 — reply individually on
  Reddit/HN, invite to email. Treat the first ~10–20 as hand-picked "founding
  testers" (the pattern behind Linear's, Appwrite's, and DoltHub's earliest
  communities).
- **Apply to Even Hub (Even Realities' third-party app platform)** — explicitly
  low-barrier ("no strict technical or experience barriers"), 10-business-day
  review, live app store already in their mobile app. Different hardware than
  Spector's current three targets, but it's a real, open, currently-live
  distribution channel — worth a low-cost compatibility check even before a
  full port.
- **Pitch the trade press that's actively covering this exact space right now**:
  UploadVR / Road to VR (they publish "how to pitch" pages — 1–2 short
  paragraphs, subject line "Pitch:"), Geeky Gadgets, Android Police, 9to5Google
  — all are currently running "what can you actually do with these glasses"
  roundups as the Ray-Ban Display third-party ecosystem opens up. This is
  free, open, and timely.
- **Post to existing communities you don't own** (relevant subreddits, Discords,
  Show HN) rather than building an owned space first — sequencing GitHub's own
  maintainer guidance recommends.
- **Publish a changelog, even with zero readers.** Linear started this in 2019
  before it had users, at roughly weekly cadence, tied to shipped work — Karri
  Saarinen's own reasoning: "it might seem silly... when you don't have many
  users, but we think it's helpful," and it became a documented recruiting and
  investor-trust signal later. For Spector this is nearly free (GitHub
  Releases or a simple page fed by commit history) and feeds the newsletter
  list above with real content instead of silence between features.
- **When Spector gets its first outside contributor, consider Excalidraw's
  model**: grant commit access after someone's first PR merges, and merge
  imperfect PRs then patch them yourself rather than requesting changes before
  merging. Founder vjeux's own framing: "this worked really well" — it keeps a
  brand-new contributor's momentum instead of stalling them in review, which
  matters disproportionately when the contributor pool is still tiny.

### 🟡 Do with a little prep
- **One 30–60 second POV demo reel** — research across two independent streams
  flagged this as the single highest-leverage first content asset (shows the
  eyes-up, no-script-face experience better than any copy can).
- **MentraOS MiniApp Store** listing — open, cross-device, actively recruiting
  third-party devs; same caveat as Even Hub (different hardware family), same
  logic (real open channel, worth a compatibility check).
- **XREAL's Android XR Catalyst program** — dev kits being distributed now;
  worth getting on the list even if the payoff (the not-yet-launched "XREAL AR
  Lab") is months out.
- **The rehearsal pacing-score end screen as a shareable moment.** This is a
  legitimate, nearly-free secondary loop (Strava/Duolingo/Spotify-Wrapped
  pattern), but be honest with yourself that rehearsing alone isn't inherently
  social the way those products are — treat it as a nice-to-have amplifier a
  user might screenshot once, not a primary growth engine.

### 🟠 Wait for a trigger, don't do yet
- **Your own Discord.** Opening one now (1 GitHub star, no users) would almost
  certainly sit at single-digit members with a dead #general — worse for
  credibility than not having one, since a skeptical visitor clicking through
  from Reddit/HN reads a 3-person Discord as a signal of failure. **Trigger to
  open one:** once you can identify ~30–50 people who'd visibly join and post
  on day one (drawn from Discussions participants, newsletter signups, engaged
  commenters) — soft-launch it pre-seeded, don't hope it into life.
- **Meta's Wearables Device Access Toolkit.** Developer preview is open, but
  publishing is currently limited to select partners; broader publishing is
  expected sometime in 2026. Worth building against and registering interest
  now, not a distribution channel yet.
- **Direct cold-pitching of big-name AR/glasses YouTubers.** Low-yield —
  Meta shipping its own native teleprompter neutralized a lot of the "look what
  this indie app does" story for the biggest channels. Revisit once there's
  real traction to point to.

### 🔴 Skip for now
- Paid ads of any kind (not needed and not the bottleneck — distribution
  channels above are all free).
- A full StoryBrand rewrite of the site (framework doesn't fit a
  category-creation, cross-brand, honesty-driven product — keep only its
  "can a 10-year-old parse this headline in 5 seconds" clarity test).
- A full Category Design campaign (naming/owning a new category needs an
  audience to campaign to — premature at zero users; the free "minimum viable"
  version above is the right-sized move for now).

---

## 4. Realistic expectations (year one)

Total addressable hardware is smaller than headline unit-sales numbers suggest,
and Meta's own CES 2026 native teleprompter reduces the addressable need on the
one device (Ray-Ban Display) that actually has an on-lens screen. Realistic
outcomes for a free, unmonetized, zero-budget OSS tool in a hardware category
still in its early-adopter phase:

- **Base case:** low hundreds of unique users over the year, with a smaller
  actively-retained core.
- **Best case, if one tactic lands** (a front-page Reddit post, an UploadVR/Road
  to VR feature, or an Even Hub/MentraOS "featured app" placement): a spike into
  the low thousands, with the normal steep drop-off after.
- Growth here is realistically **step-function** (press-hit spikes), not
  smooth compounding, until smart-glasses hardware itself goes more mainstream.
  That's a property of the category, not a signal the product or brand is
  wrong — plan content/launch timing around press hits rather than expecting
  organic virality.
- **Set expectations with a real precedent, not a hope:** Bruno's own first
  Show HN post got 7 points and 4 comments; its creator described "many months
  went by without any traction" and it took roughly **two years** to cross 500
  GitHub stars, then 10 days to go from 500 to 5,000 once a market-tailwind
  event (a competitor's pricing misstep) hit. tldraw's creator spent a full
  year building smaller, unglamorous open-source tools in public before
  tldraw itself existed. The common thread in every case study here isn't a
  clever launch — it's **answering every single early comment personally and
  continuing to ship and repost through a long flat period.** Don't read a
  quiet first month as a verdict on the product.

---

## 5. Suggested first-two-weeks sequence

1. Set up GitHub Discussions categories; link from README and every future post.
2. Convert the beta form into a "notify me when features ship" list, and start
   a changelog page/GitHub Releases habit alongside it.
3. Write and test 2–3 new hero headline options (JTBD-first) against the
   current one — ship the strongest.
4. Lock the one permanent-promise line (free core forever / no account / no
   cloud) and paste it verbatim into the README, landing footer, and FAQ.
5. Pitch UploadVR/Road to VR + Geeky Gadgets with a 1–2 paragraph email and the
   POV demo reel once it exists.
6. Apply to Even Hub's Pilot Program (check Even G2 compatibility/porting cost
   while you're at it).
7. Sign up for XREAL's Catalyst program dev-kit list.
8. Keep posting to existing subreddits/Discords/HN — reply to every single
   comment personally, invite engaged repliers to the changelog list.
9. Revisit this doc once GitHub Discussions has a real handful of regulars —
   that's the trigger to consider a Discord.

---

## 6. Open strategic questions (not decided yet, worth a future look)

- **Meta's Wearables Device Access Toolkit** (opened preview May 2026) reportedly
  lets third-party web apps push content to the Ray-Ban Display and access
  camera/mic on standard Ray-Ban Meta — surfaced independently by two separate
  research agents. If/when publishing opens beyond select partners, this could
  be a genuine native-integration opportunity distinct from marketing — worth a
  dedicated look once it's not partner-gated.
- **A low-cost port to Even Realities G2 / Mentra Live** — both have real, open,
  currently-live app-store distribution (Even Hub, MentraOS), unlike Ray-Ban
  Meta, XREAL, or Viture today. Worth scoping the porting effort against the
  distribution payoff.

---

*This plan should move with the brand — if the headline test, the visual
signature, or the community trigger point change, update this file alongside
the code, the same way BRAND.md tracks the CSS tokens.*
