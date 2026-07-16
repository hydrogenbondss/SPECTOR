window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
};

if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
    const script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    document.head.appendChild(script);
}
