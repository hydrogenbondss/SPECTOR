/* SpectorCore — pure logic layer (testable, portable)
 * ────────────────────────────────────────────────────
 * Chunking, punctuation-aware pacing, cue handling, rehearsal analytics,
 * and the motion-permission lifecycle. Zero DOM dependencies except where a
 * fake window can be injected (createMotion). Shared by the player
 * (app.html) and the landing-page editor (index.html): the editor's live
 * duration estimate and markdown import reuse these functions so there is
 * exactly one implementation of the pacing math. Do not add UI code here.
 */

    // ─── SpectorCore: pure logic layer (testable, portable) ───
    class KalmanFilter {
        constructor(processNoise = 0.0025, measurementNoise = 1.2) {
            this.Q = processNoise;
            this.R = measurementNoise;
            this.P = 1;
            this.X = 0;
            this.K = 0;
        }
        update(measurement) {
            this.P = this.P + this.Q;
            this.K = this.P / (this.P + this.R);
            this.X = this.X + this.K * (measurement - this.X);
            this.P = (1 - this.K) * this.P;
            return this.X;
        }
        reset() { this.X = 0; this.P = 1; }
    }

    // Placeholder for a decimal point mid-number (e.g. "3.5") so the sentence
    // splitter below doesn't mistake it for a sentence terminator; restored
    // after splitting. Null char is never legitimate script input.
    const DECIMAL_PLACEHOLDER = '\u0000';

    function splitSentences(text) {
        const protectedText = (text || '').replace(/(\d)\.(\d)/g, `$1${DECIMAL_PLACEHOLDER}$2`);
        const sentences = [];
        // Trailing ["'”’)]* after the terminator keeps a closing quote/paren
        // attached to the sentence it closes (`"Hello!" she said.` would
        // otherwise orphan the closing " onto the front of the next sentence).
        const regex = /[^.!?]+[.!?]+["'”’)]*/g;
        let match;
        let lastIndex = 0;
        while ((match = regex.exec(protectedText)) !== null) {
            sentences.push(match[0]);
            lastIndex = regex.lastIndex;
        }
        const tail = protectedText.slice(lastIndex).trim();
        if (tail) sentences.push(tail);
        if (!sentences.length && protectedText.trim()) sentences.push(protectedText.trim());
        const restored = sentences.map((s) => s.split(DECIMAL_PLACEHOLDER).join('.'));
        return mergeDanglingEmphasis(restored);
    }

    // A sentence terminator inside a **bold** span (e.g. "**We can do better.**")
    // gets split by the tokenizer, orphaning the closing ** in the next fragment.
    // Re-attach it so the emphasis renders instead of showing literal asterisks.
    function mergeDanglingEmphasis(parts) {
        const out = [];
        for (let i = 0; i < parts.length; i++) {
            let cur = parts[i];
            const unclosed = (cur.match(/\*\*/g) || []).length % 2 === 1;
            if (unclosed && i + 1 < parts.length && /^\s*\*\*/.test(parts[i + 1])) {
                cur += '**';
                const rest = parts[i + 1].replace(/^\s*\*\*/, '');
                if (rest.trim()) parts[i + 1] = rest;
                else i++; // consumed a standalone "**"
            }
            out.push(cur);
        }
        return out;
    }

    const chunkStrategies = {
        hybrid(text) {
            const result = [];
            splitSentences(text).forEach(sentence => {
                const words = sentence.trim().split(/\s+/);
                if (words.length <= 7) result.push(sentence.trim());
                else for (let i = 0; i < words.length; i += 6)
                    result.push(words.slice(i, i + 6).join(' '));
            });
            return result.filter(c => c.length > 0);
        },
        sentence(text) {
            return splitSentences(text).map(s => s.trim()).filter(Boolean);
        },
        word(text) {
            return text.trim().split(/\s+/).filter(Boolean);
        }
    };

    const postChunkHooks = [];

    function cuePauseMs(chunkText) {
        const tagged = (chunkText || '').match(/\[pause:(\d+)s\]/i);
        if (tagged) return parseInt(tagged[1], 10) * 1000;
        if (/^\[pause\]$/i.test((chunkText || '').trim())) return 2800;
        if (/\[pause\]/i.test(chunkText || '')) return 1800;
        return 0;
    }

    // Word count for the WPM stat -- must exclude cue markup, or scripts using
    // Spector's own [pause]/## Section syntax get an inflated, wrong avg WPM.
    function countSpokenWords(text) {
        return (text || '')
            .replace(/^##[ \t]+[^\r\n]+$/gm, '')
            .replace(/\[pause(?::\d+s)?\]/gi, '')
            .replace(/\*\*/g, '')
            .split(/\s+/)
            .filter(Boolean)
            .length;
    }

    function formatChunkHtml(chunkText) {
        let html = (chunkText || '')
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        html = html
            .replace(/\*\*([^*]+)\*\*/g, '<span class="cue-emphasis">$1</span>')
            .replace(/\[emphasis\]/gi, '')
            .replace(/\[pause(?::\d+s)?\]/gi, '<span class="cue-pause" aria-hidden="true">⏸</span>')
            .replace(/\[section:([^\]]+)\]/g, '$1');
        // Visual receipt of punctuation pacing (engine already uses these marks).
        html = html.replace(/,(?!\d)/g, '<span class="cue-breathe" aria-hidden="true">,</span>');
        html = html.replace(/([.!?]+)(["'”’)]*)$/g, '<span class="cue-hold" aria-hidden="true">$1</span>$2');
        return html;
    }

    function hybridChunkWithCues(text) {
        // Capturing group keeps each matched pause tag (with its duration, if any)
        // in the split result instead of discarding it — a plain .split() on the
        // non-capturing version silently drops "[pause:Ns]" down to a bare "[pause]".
        // A "## Section" header line is captured the same way, then converted to
        // its own atomic [section:Label] chunk below — it must never be merged
        // into surrounding sentences by the hybrid chunker.
        const segments = text.split(/(\[pause(?::\d+s)?\]|^##[ \t]+[^\r\n]+$)/im);
        const out = [];
        segments.forEach((seg) => {
            if (/^\[pause(?::\d+s)?\]$/i.test(seg)) {
                out.push(seg);
                return;
            }
            const headerMatch = seg.match(/^##[ \t]+([^\r\n]+)$/);
            if (headerMatch) {
                out.push(`[section:${headerMatch[1].trim()}]`);
                return;
            }
            const trimmed = seg.trim();
            if (trimmed) out.push(...chunkStrategies.hybrid(trimmed));
        });
        return out.length ? out : [''];
    }

    function computeMs(mode, speed, chunkText) {
        const text = chunkText || '';
        const taggedOnly = text.trim().match(/^\[pause:(\d+)s\]$/i);
        if (taggedOnly) return Math.max(1000, parseInt(taggedOnly[1], 10) * 1000);
        if (/^\[pause\]$/i.test(text.trim())) return 2800;

        let msPerWord = 380;
        if (mode === 'comfort') msPerWord = 400;
        if (mode === 'presentation') msPerWord = 460;

        const words = Math.max(1, countSpokenWords(text));
        let duration = words * msPerWord;
        if (speed === 'slow') duration *= 1.25;
        if (speed === 'fast') duration *= 0.75;

        // Additive holds — avoid stacking multiplicative punctuation into long delays.
        if (/[.!?]$/.test(text)) duration += 350;
        if (/,/.test(text)) duration += 150;
        if (/\*\*[^*]+\*\*/.test(text)) duration += 120;

        duration += cuePauseMs(text);
        return Math.max(800, Math.round(duration));
    }

    function buildRehearsalAnalytics(timings) {
        if (!timings.length) {
            return { consistency: 0, hesitations: 0, slowestLabel: '—', slowestRatio: 0 };
        }
        let hesitations = 0;
        let slowest = { i: 0, ratio: 0, text: '' };
        const ratios = timings.map((t) => {
            const expected = Math.max(1, t.expectedMs);
            const ratio = t.actualMs / expected;
            if (t.hesitated) hesitations++;
            if (ratio > slowest.ratio) {
                slowest = { i: t.index, ratio, text: (t.text || '').slice(0, 48) };
            }
            return ratio;
        });
        const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
        const variance = ratios.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / ratios.length;
        const consistency = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance) * 28)));
        return {
            consistency,
            hesitations,
            slowestLabel: slowest.text ? `"${slowest.text}"` : '—',
            slowestRatio: slowest.ratio,
        };
    }

    // Per-section pacing breakdown: groups chunk timings by which `## Section`
    // bookmark they fall under and re-runs buildRehearsalAnalytics on each
    // group. A section's own header chunk is excluded from every group (it's
    // a label, not rehearsal content). Content before the first bookmark has
    // no home section and is left out of the breakdown, though it's still
    // counted in the overall run analytics.
    function buildSectionAnalytics(timings, bookmarks) {
        if (!bookmarks || !bookmarks.length || !timings || !timings.length) return [];
        const sorted = [...bookmarks].sort((a, b) => a.index - b.index);
        return sorted.map((section, i) => {
            const nextIndex = i + 1 < sorted.length ? sorted[i + 1].index : Infinity;
            const sectionTimings = timings.filter((t) => t.index > section.index && t.index < nextIndex);
            if (!sectionTimings.length) return null;
            const analytics = buildRehearsalAnalytics(sectionTimings);
            return { label: section.label, chunkCount: sectionTimings.length, ...analytics };
        }).filter(Boolean);
    }

    function computeSpatialDeltas(filteredGamma, filteredBeta, lastGamma, lastBeta, mode) {
        const sensitivity = mode === 'comfort' ? 0.19 : 0.11;
        const rotationAmount = mode === 'comfort' ? 0.11 : 0.055;
        const scaleAmount = mode === 'comfort' ? 0.00042 : 0.00026;
        return {
            deltaX: (filteredGamma - lastGamma) * sensitivity,
            deltaY: (filteredBeta - lastBeta) * sensitivity,
            deltaRotate: (filteredGamma - lastGamma) * rotationAmount,
            deltaScale: 1 + ((filteredGamma - lastGamma) * scaleAmount)
        };
    }

    function estimateWpm(wordCount, elapsedMs) {
        if (!elapsedMs || elapsedMs < 1000) return 0;
        return Math.round(wordCount / (elapsedMs / 60000));
    }

    /** Portable motion permission + listener lifecycle (testable via createMotion(fakeWin)). */
    function createSpectorMotion(win) {
        const target = win || window;
        let handler = null;
        let bound = false;
        let permissionState = 'unknown';

        return {
            get bound() { return bound; },
            get permissionState() { return permissionState; },

            async ensurePermission() {
                if (!target.DeviceOrientationEvent) return false;
                if (permissionState === 'granted' || permissionState === 'unnecessary') return true;
                if (permissionState === 'denied') return false;
                const req = target.DeviceOrientationEvent.requestPermission;
                if (typeof req !== 'function') {
                    permissionState = 'unnecessary';
                    return true;
                }
                try {
                    const result = await req.call(target.DeviceOrientationEvent);
                    permissionState = result;
                    return result === 'granted';
                } catch (err) {
                    permissionState = 'denied';
                    return false;
                }
            },

            unbind() {
                if (handler) {
                    target.removeEventListener('deviceorientation', handler);
                    handler = null;
                }
                bound = false;
            },

            bind(onOrientation) {
                this.unbind();
                if (!target.DeviceOrientationEvent || typeof onOrientation !== 'function') return false;
                handler = (event) => onOrientation(event);
                target.addEventListener('deviceorientation', handler);
                bound = true;
                return true;
            },

            registerPageHideOnce(onHide) {
                if (typeof onHide !== 'function') return;
                target.addEventListener('pagehide', onHide, { once: true });
            }
        };
    }

    // Plain-text version of a chunk for screen readers/aria-live -- strips cue
    // markup instead of reading it aloud (no "asterisk asterisk", no pause icon).
    function chunkToAnnounceText(raw) {
        return (raw || '')
            .replace(/\[section:([^\]]+)\]/g, '$1')
            .replace(/\[pause(?::\d+s)?\]/gi, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .trim();
    }

    /* Markdown → Spector script. Targeted, dependency-free subset — NOT a
     * full CommonMark implementation. Deliberate limits (kept small and
     * predictable rather than clever):
     *   - Preserves Spector cue syntax untouched: **emphasis**, [pause],
     *     [pause:Ns], and "## Section" header lines (which double as
     *     Markdown H2s, so those lines are kept verbatim).
     *   - Strips: H1/H3+ headings → bare text, list markers, blockquote >,
     *     code fences (contents kept), inline `code` (contents kept),
     *     images, link URLs (link text kept), *italic* and _italic_ markers,
     *     __bold__ → **bold** (mapped onto Spector emphasis),
     *     ~~strikethrough~~ (text dropped — treated as deleted draft words).
     *   - Not handled: nested emphasis, tables, footnotes, HTML blocks,
     *     setext headings, reference-style links. Such constructs flatten
     *     to whatever the line/inline passes above leave behind. */
    function markdownToScript(md) {
        let text = String(md || '').replace(/\r\n?/g, '\n');

        // Fenced code blocks: keep the contents, drop the fence lines.
        text = text.replace(/```[^\n]*\n([\s\S]*?)```/g, (m, inner) => '\n' + inner + '\n');

        // Line-oriented passes (headings, lists, quotes, rules). "## " is NOT
        // stripped: it is Spector's section syntax as well as Markdown H2.
        text = text.split('\n').map((line) => {
            const t = line.trim();
            if (/^#{3,}\s+/.test(t)) return t.replace(/^#{3,}\s+/, '');
            if (/^#\s+/.test(t)) return t.replace(/^#\s+/, '');
            if (/^(-{3,}|\*{3,}|_{3,})$/.test(t)) return '';
            if (/^>\s?/.test(t)) return t.replace(/^>\s?/, '');
            if (/^[-*+]\s+/.test(t)) return t.replace(/^[-*+]\s+/, '');
            if (/^\d+[.)]\s+/.test(t)) return t.replace(/^\d+[.)]\s+/, '');
            return line;
        }).join('\n');

        // Inline passes. [pause]/[pause:Ns] survive because the link regex
        // requires a "(url)" after the brackets.
        text = text.replace(/!\[[^\]]*\]\([^)]*\)/g, '');
        text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
        text = text.replace(/~~[^~]+~~/g, '');
        // Removals above can leave runs of double spaces; scripts never need them.
        text = text.replace(/ {2,}/g, ' ');
        text = text.replace(/__([^_]+)__/g, '**$1**');
        text = text.replace(/`([^`]+)`/g, '$1');
        text = text.replace(/\*(?!\*)([^*\n]+)\*(?!\*)/g, '$1');
        text = text.replace(/(^|[^A-Za-z0-9_])_([^_\n]+)_(?![A-Za-z0-9_])/g, '$1$2');

        return text
            .split('\n').map((l) => l.replace(/\s+$/, '')).join('\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }

    // Total scripted rehearsal time at a mode/speed: chunk exactly like the
    // player does, then sum the per-chunk hold the engine would schedule.
    // This is the same math the player's remaining-time display uses over
    // its live chunk array, exposed for the landing-page editor.
    function estimateDurationMs(text, mode, speed) {
        const chunks = hybridChunkWithCues(text || '');
        let total = 0;
        chunks.forEach((c) => { total += computeMs(mode || 'focus', speed || 'normal', c); });
        return total;
    }

    // Which word inside the active chunk is "being spoken" right now: linear
    // interpolation across the chunk's scheduled hold. Visual aid only — the
    // engine's chunk-advance timing never consults this.
    function wordIndexForElapsed(elapsedMs, chunkMs, wordCount) {
        if (!wordCount || wordCount < 1) return -1;
        if (!chunkMs || chunkMs < 1) return 0;
        const frac = Math.min(1, Math.max(0, elapsedMs / chunkMs));
        return Math.min(wordCount - 1, Math.floor(frac * wordCount));
    }


    // ─── Voice-alignment math (D1 voice-mode spike) ───
    // Pure, DOM-free, audio-free: maps a stream of ASR transcript words onto
    // the script's chunk list and reports where in the script the speaker
    // most likely is. This is a CORRECTION SIGNAL for the deterministic
    // pacing engine — never the display driver (see
    // docs/patent-notes-voice-pacing.md).
    function normalizeSpokenWord(w) {
        return String(w || '')
            .toLowerCase()
            .replace(/^[^a-z0-9']+/, '')
            .replace(/[^a-z0-9']+$/, '')
            .replace(/''+/g, "'");
    }

    // Spoken words of a chunk, cue markup stripped (shares normalization with
    // countSpokenWords but keeps the words, in order).
    function extractChunkWords(chunkText) {
        return String(chunkText || '')
            .replace(/^##[ \t]+[^\r\n]+$/gm, '')
            .replace(/\[pause(?::\d+s)?\]/gi, '')
            .replace(/\*\*/g, '')
            .split(/\s+/)
            .map(normalizeSpokenWord)
            .filter(Boolean);
    }

    // Cheap bounded edit distance (capped) for fuzzy word equality.
    function editDistanceAtMost(a, b, cap) {
        const la = a.length, lb = b.length;
        if (Math.abs(la - lb) > cap) return cap + 1;
        let prev = new Array(lb + 1);
        for (let j = 0; j <= lb; j++) prev[j] = j;
        for (let i = 1; i <= la; i++) {
            let cur = [i];
            let rowMin = i;
            for (let j = 1; j <= lb; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
                if (cur[j] < rowMin) rowMin = cur[j];
            }
            if (rowMin > cap) return cap + 1;
            prev = cur;
        }
        return prev[lb];
    }

    // Fuzzy word equality: exact, shared 4-char prefix, or ≤1 edit for
    // words of 4+ chars. Deliberately conservative — false jumps are worse
    // than missed corrections.
    function wordsMatchFuzzy(a, b) {
        if (!a || !b) return false;
        if (a === b) return true;
        if (a.length >= 4 && b.length >= 4 && a.slice(0, 4) === b.slice(0, 4)) return true;
        if (a.length >= 4 && b.length >= 4 && editDistanceAtMost(a, b, 1) <= 1) return true;
        return false;
    }

    /* Align a transcript word stream to the script's chunks.
     *
     * transcriptWords: array of raw ASR words (order = utterance order).
     * chunks: the player's chunk array (raw chunk text, cues included).
     * opts.hintIndex: chunk the player currently shows — search starts here
     *   and never moves backwards (monotonic, matching the correction-signal
     *   design). opts.maxLookaheadChunks bounds the forward window.
     *
     * Returns { chunkIndex, confidence, matchedWords, transcriptWordsUsed }.
     * confidence is the strong-match ratio over the trailing window of
     * transcript words (0..1); low confidence ⇒ caller should ignore the
     * result and keep pacing on punctuation alone.
     *
     * Algorithm: flatten the candidate chunk range into a word sequence with
     * chunk ids, then greedily match transcript words in order — each word
     * searches a bounded forward window for its best fuzzy match, jumping
     * ahead when the speaker skipped lines, staying put on garbage.
     * Stateless: callers pass the full transcript-so-far each call. */
    function alignTranscript(transcriptWords, chunks, opts = {}) {
        const hint = Math.max(0, Math.min(opts.hintIndex || 0, chunks.length - 1));
        const lookahead = Math.max(1, opts.maxLookaheadChunks || 10);
        const end = Math.min(chunks.length, hint + lookahead);
        const flat = [];
        const flatChunk = [];
        for (let i = hint; i < end; i++) {
            extractChunkWords(chunks[i]).forEach((w) => { flat.push(w); flatChunk.push(i); });
        }
        const words = (transcriptWords || []).map(normalizeSpokenWord).filter(Boolean);
        const WINDOW = 48; // max flat words searched ahead per transcript word
        let anchor = 0;            // next flat position to consider
        let lastMatch = -1;
        let strong = 0, considered = 0;
        let t = 0;
        // Skip leading transcript words that predate the hint position only
        // when they clearly match before it would be impossible — with a
        // stateless API we simply match everything from the hint forward.
        while (t < words.length) {
            const w = words[t];
            // Trailing garbage (hesitations, ASR noise) shouldn't erase a
            // solid earlier match: stop scoring after 6 consecutive misses.
            let bestJ = -1, bestScore = 0;
            const limit = Math.min(flat.length, anchor + WINDOW);
            for (let j = anchor; j < limit; j++) {
                if (wordsMatchFuzzy(w, flat[j])) {
                    const score = 1 - (j - anchor) / WINDOW; // prefer near matches
                    if (score > bestScore) { bestScore = score; bestJ = j; }
                    if (flat[j] === w) break; // exact: take it
                }
            }
            if (bestJ >= 0 && bestScore >= 0.2) {
                lastMatch = bestJ;
                anchor = bestJ + 1;
                strong += 1;
                considered += 1;
                t++;
            } else {
                considered += 1;
                t++;
            }
        }
        if (lastMatch < 0) {
            return { chunkIndex: hint, confidence: 0, matchedWords: 0, transcriptWordsUsed: words.length };
        }
        const confidence = considered ? Math.round((strong / considered) * 100) / 100 : 0;
        return {
            chunkIndex: flatChunk[lastMatch],
            confidence,
            matchedWords: strong,
            transcriptWordsUsed: words.length,
        };
    }

    const SpectorCore = {
        KalmanFilter,
        chunkStrategies,
        postChunkHooks,
        splitSentences,
        createMotion: createSpectorMotion,
        chunk(text, strategyName = 'hybrid') {
            const fn = chunkStrategies[strategyName] || chunkStrategies.hybrid;
            let chunks = fn(text);
            postChunkHooks.forEach(hook => { chunks = hook(chunks, text) || chunks; });
            return chunks;
        },
        registerChunker(name, fn) { chunkStrategies[name] = fn; },
        registerPostChunkHook(fn) { postChunkHooks.push(fn); },
        getMs: computeMs,
        cuePauseMs,
        formatChunkHtml,
        countSpokenWords,
        hybridChunkWithCues,
        buildRehearsalAnalytics,
        buildSectionAnalytics,
        chunkToAnnounceText,
        computeSpatialDeltas,
        estimateWpm,
        markdownToScript,
        estimateDurationMs,
        wordIndexForElapsed,
        alignTranscript,
        extractChunkWords,
        wordsMatchFuzzy,
        decodeScript(encoded) {
            try { return decodeURIComponent(atob(encoded)); }
            catch { return null; }
        }
    };
    window.SpectorCore = SpectorCore;
