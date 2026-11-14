# Patent notes — voice-responsive teleprompter pacing (D1 spike)

**Status:** engineering research notes, not legal advice. Owner should obtain
a formal freedom-to-operate (FTO) opinion from a patent attorney before any
voice feature ships to users (i.e., before D2). Written 2026-11-14 as part of
the D1 voice-mode spike, per the standing gate: find the patents, read the
independent claims, document how the intended design reads against them.

---

## 1. The patent that matters

| | |
|---|---|
| **US 9,953,646 B2** | "Method and system for dynamic speech recognition and tracking of prewritten script" |
| Assignee | **Belleau Technologies LLC** — the publisher of PromptSmart (© BELLEAU TECHNOLOGIES, LLC on promptsmart.com; App Store seller of record). This is the PromptSmart **VoiceTrack™** patent family. |
| Inventors | Eric Sadkin, Lakshmish Kaushik, Jasjeet Gill, Etay Luz |
| Priority date | 2014-09-02 |
| Filed | 2015-09-02 |
| Granted | 2018-04-24 |
| Expected expiry | ~2035 (20 years from filing, plus any term adjustment; **maintenance-fee status not verified here** — check USPTO Patent Center before launch decisions) |
| Pre-grant publication | US 2016/0098180 A1 (same family, same claims as filed) |

Source: [Google Patents — US9953646B2](https://patents.google.com/patent/US9953646B2/en)
(retrieved via Internet Archive snapshot 2023-04-24; metadata cross-checked
against the USPTO grant PDF).

Related (older) Promptu Systems patents exist for TV voice control
(US 7,260,538 B2, filed 2003, **expired 2024-12-26**, litigated in
Comcast v. Promptu) — different domain (remote-control commands, not
prompting), expired, and not read further here.

### Independent claims (4): 1, 12, 15, 18

All four share the same core sequence (letters follow claim 1):

- **(a–d)** receive a "text artifact" (the script) containing artifact words;
  store it; retrieve it; **display it** on a screen.
- **(e–f)** receive **vocal input**; run speech recognition to produce
  "hypothesis words".
- **(g)** compare a *predetermined number* of hypothesis words to a
  *predetermined number* of artifact words.
- **(h)** determine a **match location** in the script where the hypothesis
  words match artifact words.
- **(i)** **alter the display to display the match location** — i.e., the
  recognized speech *moves the prompter*.

Differentiators layered on the core:

- **Claim 1** adds: determining font size and screen orientation, and
  *altering the comparison window size* based on them (a viewport-adaptive
  matching window).
- **Claim 12** adds: a specific group-similarity scoring step (single number
  representing degree of similarity between hypothesis group and artifact
  group) and an explicit "establishing a scroll rate" dependent claim (14).
- **Claim 15** adds: bigram/trigram lists used to break ties between multiple
  candidate match groups (pick the group with the most matching bigrams +
  trigrams).
- **Claim 18** recites the same method as a system / non-transitory-medium
  claim (device claim).

Plain-English summary of what the independent claims cover as a combination:
**a teleprompter whose display position is driven by matching recognized
speech to the script — the ASR-to-script match location IS where the display
goes.** That is exactly VoiceTrack's marketed behavior: scroll while you
speak, stop when you pause, resume at your return position, catch you when
you go off script.

## 2. Prior art landscape (voice-following prompting is not new)

| Reference | What it shows | Date |
|---|---|---|
| **US 9,395,811 B2** (Microsoft) | "Automatic text scrolling on a display device" — scrolling driven from speech input | priority 2011-07-22 |
| **US 9,524,753 B2** (Apple) | "Teleprompter tool for voice-over tool" | priority 2010-08-06 |
| **US 7,260,538 B2** (Promptu, *expired*) | voice control of on-screen content (different mechanism, same company) | filed 2003 |
| [TalkPrompter](https://github.com/Sven-Bo/talkprompter) (MIT) | open-source offline voice-following teleprompter (Vosk) | 2023– |
| [followspot](https://github.com/JoeKarlsson/followspot) | open-source in-browser voice-following prompter (whisper.cpp WASM) | 2024– |
| Commercial: Scriptfox, Teleprompter.com "VoiceGlide", VoicePrompter | shipping voice-following prompters marketed openly against PromptSmart | 2024–26 |

Relevance: the 2010/2011 Microsoft and Apple grants **predate the '646
priority date (2014-09-02)** and describe voice-driven scrolling/prompting;
the open-source and commercial field shows independent implementations have
shipped publicly for years. This is context for an FTO opinion, not a
conclusion — claim construction and the specific asserted claims matter.

## 3. How Spector's intended design reads against the claims

**The architectural decision (made before this spike, for product reasons):
Spector's punctuation-pacing engine remains the deterministic base layer.**
It paces autonomously — chunking + `getMs()` timing, exactly as shipped
today, with zero voice involvement. On-device ASR output is consumed as a
**correction/alignment signal only**: `alignTranscript(transcriptWords,
chunks) → { chunkIndex, confidence }` proposes a bounded repositioning
(fuzzy match within a lookahead window, with a confidence floor), and the
player may nudge its current position by a bounded amount. The system never:

- scrolls *because* speech matched (no "display the match location" loop),
- starts/stops/resumes on voice activity,
- replaces the timer with ASR position,
- blocks or gates playback on voice.

Element-by-element against claim 1's core:

| Claim element | Intended design | Reads on? |
|---|---|---|
| a–d (script stored + displayed) | yes — any teleprompter does this | yes (generic) |
| e–f (vocal input → hypothesis words) | yes — on-device ASR (Moonshine/whisper.cpp), never Web Speech API | yes (generic to voice prompters) |
| g–h (compare hypothesis words to artifact words; find match location) | yes — bounded-lookahead fuzzy alignment produces exactly a match location | **yes** — alignment math is unavoidable in any voice-aware prompter |
| i (**alter the display to display the match location**) | **no — design constraint**: display position is owned by the deterministic pacing engine; voice output can only *nudge position within a bounded window* and only when confidence exceeds a floor. The display is never driven to "the match location" as its position source. | **Distinct by design** |
| claim-1 extras (font size/orientation-adaptive window; claim 12 group-similarity number; claim 15 bigram/trigram tie-break; claim 18 medium claim) | not used: our matching is sequence alignment over a sliding window with confidence scoring — different mechanism from the recited group-similarity / n-gram-selection steps | not used |

**Honest residual risk:** element (i) is the pressure point. A court could
construe "altering the display … to display the match location" broadly
enough to read on any voice-influenced repositioning. Our mitigations are
(1) the base layer is genuinely autonomous (position is timer-owned — the
voice path is a bounded drift corrector, which is also how the Northeastern
"presentation tracking" research literature frames the problem), (2) we do
not implement the claims' distinguishing features, and (3) the 2010/2011
Microsoft/Apple art predates the priority date on the same concept. None of
that is a guarantee; **it is an FTO question for a lawyer, and the doc's
recommendation is: no voice feature ships in D2 without that opinion.**

## 4. What this spike will and will not build

**Will (D1, this branch):**

- `SpectorCore.alignTranscript` — pure, testable alignment math
  (transcript words → script chunk index + confidence, bounded lookahead).
- `public/voice-lab.html` — unlinked lab page proving on-device ASR
  (vendored engine + model, same-origin) can feed the alignment function in
  real time, with latency/memory/size numbers.

**Will not (explicitly out of scope, including in the D2 proposal until FTO
clears):**

- voice-driven scrolling, stopping, resuming, or "waits for you" semantics
  (VoiceTrack behavior — claim 1(a)–(i) as a live loop);
- any integration into the shipped player UI;
- any use of the claims' distinguishing mechanisms (viewport-adaptive
  comparison window, group-similarity number, bigram/trigram selection).

## 5. Gate result

**Proceed with the spike** — the intended design (correction signal inside a
deterministic pacer) is materially different from the independent claims'
match-location-driven display, and the patent's own differentiating features
are not part of the design. **Flagged, not silently resolved:** the (i)
element risk above and the pre-2014 prior art both need a qualified FTO
opinion before D2 ships anything user-facing. This document is part of the
public record of that good-faith engineering process.

— D1 spike, 2026-11-14. Not legal advice.
