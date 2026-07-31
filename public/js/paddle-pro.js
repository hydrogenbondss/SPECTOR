/**
 * Spector Pro — shared Paddle checkout + local entitlement helpers.
 *
 * Static site, no backend: checkout.completed sets localStorage.spector_pro.
 * Spoofable via DevTools — accepted (docs/PADDLE.md). Client tokens are safe
 * to ship in frontend code.
 *
 * Load with: <script src="https://cdn.paddle.com/paddle/v2/paddle.js" async
 *   onload="if (window.SpectorPro) SpectorPro.initPaddle();"></script>
 * and <script src="/js/paddle-pro.js"></script> before that onload can fire
 * (paddle-pro.js should be sync/blocking or earlier in the document).
 */
(function (global) {
    'use strict';

    var CLIENT_TOKEN = 'live_8212ac5b4b5470643f03bb7c7a7';
    var PRICE_ID = 'pri_01kx8xyrewyg78qw3hvcf9edak';
    var STORAGE_KEY = 'spector_pro';
    var HISTORY_FREE = 5;
    var HISTORY_PRO = 50;

    var paddleReady = false;

    function isPro() {
        try { return !!localStorage.getItem(STORAGE_KEY); } catch (e) { return false; }
    }

    function setPro(value) {
        try { localStorage.setItem(STORAGE_KEY, value || 'paddle'); } catch (e) { /* ignore */ }
    }

    function historyLimit() {
        return isPro() ? HISTORY_PRO : HISTORY_FREE;
    }

    function initPaddle(opts) {
        opts = opts || {};
        if (!CLIENT_TOKEN || typeof global.Paddle === 'undefined') return false;
        if (CLIENT_TOKEN.indexOf('test_') === 0) global.Paddle.Environment.set('sandbox');
        if (paddleReady) return true;
        global.Paddle.Initialize({
            token: CLIENT_TOKEN,
            eventCallback: function (event) {
                if (event.name === 'checkout.completed') {
                    setPro((event.data && event.data.transaction_id) || 'paddle');
                    if (typeof opts.onCompleted === 'function') opts.onCompleted(event);
                    if (typeof global.dispatchEvent === 'function') {
                        try {
                            global.dispatchEvent(new CustomEvent('spector:pro', { detail: { source: 'paddle' } }));
                        } catch (e) { /* IE ignore */ }
                    }
                }
            },
        });
        paddleReady = true;
        return true;
    }

    function openCheckout() {
        if (isPro()) return false;
        if (!CLIENT_TOKEN || !PRICE_ID || typeof global.Paddle === 'undefined') return false;
        initPaddle();
        global.Paddle.Checkout.open({ items: [{ priceId: PRICE_ID, quantity: 1 }] });
        return true;
    }

    function activateLicenseKey(key) {
        var trimmed = (key || '').trim();
        if (trimmed.length < 8) return { ok: false, message: 'That key doesn\'t look right — check the email from your purchase.' };
        setPro(trimmed);
        return { ok: true, message: 'Pro activated ✓' };
    }

    global.SpectorPro = {
        CLIENT_TOKEN: CLIENT_TOKEN,
        PRICE_ID: PRICE_ID,
        STORAGE_KEY: STORAGE_KEY,
        HISTORY_FREE: HISTORY_FREE,
        HISTORY_PRO: HISTORY_PRO,
        isPro: isPro,
        setPro: setPro,
        historyLimit: historyLimit,
        initPaddle: initPaddle,
        openCheckout: openCheckout,
        activateLicenseKey: activateLicenseKey,
    };
})(typeof window !== 'undefined' ? window : this);
