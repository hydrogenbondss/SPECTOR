/**
 * Spector beta feedback storage abstraction.
 * Default: local draft + optional mailto handoff (user must send).
 * Remote provider can be plugged via window.SPECTOR_BETA_REMOTE_SUBMIT later.
 * No secrets. No emails of other testers.
 */
(function (global) {
    'use strict';

    var STORAGE_PREFIX = 'spector_beta_feedback_v1:';

    function keyFor(testerId) {
        return STORAGE_PREFIX + String(testerId || '').trim();
    }

    function saveLocal(payload) {
        try {
            localStorage.setItem(keyFor(payload.testerId), JSON.stringify({
                savedAt: new Date().toISOString(),
                payload: payload
            }));
            return true;
        } catch (err) {
            return false;
        }
    }

    function loadLocal(testerId) {
        try {
            var raw = localStorage.getItem(keyFor(testerId));
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (err) {
            return null;
        }
    }

    function downloadJson(payload) {
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'spector-beta-feedback-' + payload.testerId + '.json';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    }

    function buildMailto(payload) {
        var subject = encodeURIComponent('SPECTOR beta feedback — ' + payload.testerId);
        var lines = [
            'Tester ID: ' + payload.testerId,
            'Device: ' + (payload.deviceLabel || ''),
            'Protocol: ' + (payload.protocol || ''),
            'Overall: ' + (payload.overall || ''),
            'Setup difficulty: ' + (payload.setupDifficulty || ''),
            'Readability: ' + (payload.readability || 'n/a'),
            'Usefulness: ' + (payload.usefulness || ''),
            'Use again: ' + (payload.useAgain || ''),
            '',
            'What worked:',
            payload.worked || '',
            '',
            'What did not work:',
            payload.didNotWork || '',
            '',
            'Confusing:',
            payload.confusing || '',
            '',
            'Would change:',
            payload.wouldChange || '',
            '',
            'Comments:',
            payload.comments || '',
            '',
            'Checklist:',
            JSON.stringify(payload.checklist || [], null, 2)
        ];
        var body = encodeURIComponent(lines.join('\n'));
        return 'mailto:hello@spectorlabs.io?subject=' + subject + '&body=' + body;
    }

    /**
     * @param {object} payload
     * @returns {Promise<{ok:boolean, local:boolean, remote:string, mailtoOpened:boolean}>}
     */
    async function submit(payload) {
        var local = saveLocal(payload);
        try { downloadJson(payload); } catch (err) { /* ignore */ }

        var remote = 'not_configured';
        if (typeof global.SPECTOR_BETA_REMOTE_SUBMIT === 'function') {
            try {
                var remoteResult = await global.SPECTOR_BETA_REMOTE_SUBMIT(payload);
                remote = (remoteResult && remoteResult.status) || 'ok';
            } catch (err) {
                remote = 'error';
            }
        }

        var mailtoOpened = false;
        try {
            global.location.href = buildMailto(payload);
            mailtoOpened = true;
        } catch (err) {
            mailtoOpened = false;
        }

        return {
            ok: local || mailtoOpened || remote === 'ok',
            local: local,
            remote: remote,
            mailtoOpened: mailtoOpened
        };
    }

    global.SpectorBetaFeedback = {
        saveLocal: saveLocal,
        loadLocal: loadLocal,
        submit: submit,
        buildMailto: buildMailto
    };
})(window);
