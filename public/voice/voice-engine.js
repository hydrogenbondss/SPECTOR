/* Spector voice-mode engine (D1 spike) — lazy-loaded, opt-in only.
 *
 * Everything here runs ON-DEVICE: the ASR runtime (vendored transformers.js +
 * ONNX Runtime Web) and the Moonshine tiny model are served same-origin under
 * /voice/ and cached by the service worker in the separate spector-voice-v1
 * cache. No CDN, no Web Speech API (Chrome routes that through Google), no
 * network calls beyond same-origin file fetches.
 *
 * Output is a CORRECTION SIGNAL: alignTranscript() suggests a chunk position
 * + confidence; the deterministic pacing engine remains the display driver.
 * Internal patent review — kept out of the repo; D2 requires an FTO opinion
 * before any user-facing voice work.
 */
(function () {
    'use strict';

    const VENDOR = '/voice/vendor/';
    const MODEL = '/voice/model/';

    let pipe = null;
    let loading = null;

    function configure() {
        const T = window.Transformers;
        T.env.allowLocalModels = true;
        T.env.allowRemoteModels = false; // hard wall: never fetch from HF/CDN
        T.env.backends.onnx.wasm.wasmPaths = VENDOR;
        // wasm threads need SharedArrayBuffer (COOP/COEP), which the site does
        // not set — single thread runs fine without it.
        T.env.backends.onnx.wasm.numThreads = 1;
    }

    /* Load the ASR pipeline (one-time; ~44 MB same-origin downloads, then the
     * SW voice cache serves them). Returns { loadMs, heapDeltaMB }. */
    async function load() {
        if (pipe) return null;
        if (loading) return loading;
        loading = (async () => {
            configure();
            const heap0 = performance.memory ? performance.memory.usedJSHeapSize : 0;
            const t0 = performance.now();
            const T = window.Transformers;
            // Default dtype resolution ('quantized', uint8 dynamic) — the int8
            // static build uses ConvInteger, which ORT-web's wasm backend lacks.
            pipe = await T.pipeline('automatic-speech-recognition', MODEL);
            const loadMs = Math.round(performance.now() - t0);
            const heap1 = performance.memory ? performance.memory.usedJSHeapSize : 0;
            return { loadMs, heapDeltaMB: Math.round((heap1 - heap0) / 1048576) };
        })();
        try {
            return await loading;
        } finally {
            loading = null;
        }
    }

    /* Transcribe a mono 16 kHz Float32 buffer. Returns { text, words, inferMs }. */
    async function transcribeBuffer(samples) {
        if (!pipe) await load();
        const t0 = performance.now();
        const out = await pipe(samples, { chunk_length_s: 30, stride_length_s: 0 });
        const inferMs = Math.round(performance.now() - t0);
        const text = (out && out.text) || '';
        const words = text.split(/\s+/).filter(Boolean);
        return { text, words, inferMs };
    }

    /* ── Mic capture ─────────────────────────────────────────────── */
    let audioCtx = null;
    let mediaStream = null;
    let processor = null;
    let samples = [];          // Float32 chunks, 16 kHz
    let running = false;
    let pumpTimer = null;

    async function startMic(onSegment) {
        if (running) return false;
        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
        });
        audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const src = audioCtx.createMediaStreamSource(mediaStream);
        // ScriptProcessor is deprecated but dependency-free; AudioWorklet would
        // need an extra same-origin module file. Fine for a lab spike.
        processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (e) => {
            samples.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        };
        src.connect(processor);
        processor.connect(audioCtx.destination);
        running = true;
        // Every 1.5 s: transcribe the trailing 8 s window, diff tokens, emit.
        let doneText = '';
        pumpTimer = setInterval(async () => {
            if (!running) return;
            const flat = flatten(samples);
            if (flat.length < 16000) return; // <1 s of audio
            const windowSec = 8;
            const keep = 16000 * windowSec;
            const seg = flat.slice(-keep);
            try {
                const r = await transcribeBuffer(seg);
                // Prefix-diff against the previous window's text: only NEW words
                // extend the cumulative transcript.
                const fresh = r.text.startsWith(doneText) ? r.text.slice(doneText.length) : r.text;
                doneText = r.text;
                onSegment({
                    segmentText: r.text,
                    newWords: fresh.split(/\s+/).filter(Boolean),
                    windowSec: seg.length / 16000,
                    inferMs: r.inferMs,
                    audioEndToAlignMs: null, // set by caller with alignment time
                });
            } catch (err) {
                onSegment({ error: String(err && err.message || err) });
            }
        }, 1500);
        return true;
    }

    function stopMic() {
        running = false;
        clearInterval(pumpTimer);
        if (processor) { processor.disconnect(); processor = null; }
        if (mediaStream) { mediaStream.getTracks().forEach((t) => t.stop()); mediaStream = null; }
        if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
        samples = [];
    }

    function flatten(chunks) {
        let n = 0;
        chunks.forEach((c) => { n += c.length; });
        const out = new Float32Array(n);
        let o = 0;
        chunks.forEach((c) => { out.set(c, o); o += c.length; });
        return out;
    }

    /* Minimal RIFF/WAVE parser (16-bit PCM) — avoids decodeAudioData
     * differences across browsers for afconvert-style WAVs. Returns mono
     * Float32 samples at the file's own rate (we generate 16 kHz). */
    async function decodeWav(url) {
        const res = await fetch(url);
        const buf = await res.arrayBuffer();
        const dv = new DataView(buf);
        if (dv.getUint32(0, false) !== 0x52494646) throw new Error('not a RIFF/WAVE file');
        let off = 12;
        let fmt = null, dataOff = -1, dataLen = -1;
        while (off + 8 <= dv.byteLength) {
            const id = dv.getUint32(off, false);
            const sz = dv.getUint32(off + 4, true);
            if (id === 0x666d7420) fmt = { off: off + 8, size: sz };
            if (id === 0x64617461) { dataOff = off + 8; dataLen = sz; break; }
            off += 8 + sz + (sz % 2);
        }
        if (!fmt || dataOff < 0) throw new Error('WAV fmt/data chunk missing');
        const audioFormat = dv.getUint16(fmt.off, true);
        const numChannels = dv.getUint16(fmt.off + 2, true);
        const sampleRate = dv.getUint32(fmt.off + 4, true);
        const bitsPerSample = dv.getUint16(fmt.off + 14, true);
        if (audioFormat !== 1 || bitsPerSample !== 16) throw new Error('only 16-bit PCM WAV supported');
        const frames = Math.floor(dataLen / 2);
        const out = new Float32Array(frames);
        for (let i = 0; i < frames; i++) out[i] = dv.getInt16(dataOff + i * 2, true) / 32768;
        // Resample naive linear interpolation if the file is not 16 kHz.
        if (sampleRate !== 16000) {
            const ratio = 16000 / sampleRate;
            const n = Math.floor(frames * ratio);
            const rs = new Float32Array(n);
            for (let i = 0; i < n; i++) rs[i] = out[Math.min(frames - 1, Math.floor(i / ratio))];
            return rs;
        }
        return out;
    }

    window.SpectorVoice = { load, transcribeBuffer, startMic, stopMic, decodeWav };
})();
