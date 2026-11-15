/* Spector service worker — offline shell for installed PWA rehearsal */
const CACHE = 'spector-v14'; // + voice-mode spike: /voice/* routed to a separate model cache
const ORIGIN = self.location.origin;

/* Voice-mode ASR runtime + models (D1 spike): large, immutable, opt-in files
   under /voice/. Kept in their OWN versioned cache so the core offline shell
   stays lean and core cache bumps never touch them. The directory layout
   versions the payloads (/voice/vendor/, /voice/model/); bump VOICE_CACHE
   when replacing engine or model files. */
const VOICE_CACHE = 'spector-voice-v1';

async function voiceFirst(request) {
    const cached = await caches.match(request, { cacheName: VOICE_CACHE });
    if (cached) return cached;
    const res = await fetch(request);
    if (res && res.status === 200 && res.type !== 'opaque') {
        const clone = res.clone();
        caches.open(VOICE_CACHE).then((c) => c.put(request, clone));
    }
    return res;
}

function assetUrl(path) {
    if (path.startsWith('http')) return path;
    const normalized = path.startsWith('/') ? path : '/' + path.replace(/^\.\//, '');
    return ORIGIN + normalized;
}

const ASSETS = [
    '/index.html',
    '/app.html',
    '/say.html',
    '/spector-core.js',
    '/style.css',
    '/manifest.json',
    '/verify-sw.html',
    '/sw-prime.html',
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then(async (cache) => {
            for (const path of ASSETS) {
                try {
                    await cache.add(assetUrl(path));
                } catch (_) { /* best-effort per asset */ }
            }
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE && k !== VOICE_CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

function shellPathFor(pathname) {
    if (pathname.endsWith('app.html')) return '/app.html';
    if (pathname.endsWith('say.html')) return '/say.html';
    if (pathname.endsWith('index.html') || pathname === '/' || pathname.endsWith('/')) return '/index.html';
    return null;
}

/* Stable-URL, mutable-content assets (style.css, manifest.json, any js) must stay
   in lock-step with the freshly-fetched HTML, so serve them network-first too.
   Otherwise a fresh HTML page can paint against a stale cached stylesheet (FOUC). */
function isNetworkFirstAsset(pathname) {
    return /\.(css|js|json)$/.test(pathname);
}

async function matchCached(path) {
    const abs = assetUrl(path);
    return (await caches.match(abs))
        || (await caches.match(path))
        || (await caches.match('./' + path.replace(/^\//, '')));
}

/** Network-first with cache fallback. Used for HTML shells AND css/js/json so
   copy + style updates always propagate together and never skew (FOUC fix).
   `fallbackPath` lets shells fall back to their cached app shell when offline. */
async function networkFirst(request, fallbackPath) {
    try {
        const res = await fetch(request);
        if (res && res.status === 200 && res.type !== 'opaque') {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
        }
        return res;
    } catch (err) {
        const fallback = (await caches.match(request)) || (fallbackPath && await matchCached(fallbackPath));
        if (fallback) return fallback;
        return new Response('Offline — open Spector while online first.', { status: 503, statusText: 'Offline' });
    }
}

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    const shellPath = shellPathFor(url.pathname);

    e.respondWith((async () => {
        if (shellPath) {
            return networkFirst(e.request, shellPath);
        }

        // Voice runtime + models: cache-first in the separate voice cache.
        if (url.origin === ORIGIN && url.pathname.startsWith('/voice/')) {
            return voiceFirst(e.request);
        }

        // style.css / js / json: network-first so they never skew against fresh HTML
        if (url.origin === ORIGIN && isNetworkFirstAsset(url.pathname)) {
            return networkFirst(e.request, null);
        }

        const exact = await caches.match(e.request);
        if (exact) return exact;

        try {
            const res = await fetch(e.request);
            if (res && res.status === 200 && res.type !== 'opaque') {
                const clone = res.clone();
                caches.open(CACHE).then((c) => c.put(e.request, clone));
            }
            return res;
        } catch (err) {
            return new Response('Offline — open Spector while online first.', { status: 503, statusText: 'Offline' });
        }
    })());
});
