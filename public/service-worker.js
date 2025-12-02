const CACHE_NAME = 'saban-bot-v3';
const ASSETS = [
    '/',
    '/index.html',
    '/bot-widget.js',
    '/bot-brain.js',
    '/admin.js',
    '/manifest.json'
    // הסרתי את admin-bot מקבצי החובה כדי למנוע קריסה אם השם לא תואם
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // מנסים לטעון את קבצי החובה
            return cache.addAll(ASSETS).catch(err => {
                console.warn('חלק מהקבצים לא נטענו למטמון:', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) return caches.delete(key);
            })
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // התעלמות מבקשות Chrome Extension וכו'
    if (!url.protocol.startsWith('http')) return;

    // 1. קבצי JSON מ-GitHub - תמיד מהרשת
    if (url.hostname === 'raw.githubusercontent.com') {
        e.respondWith(
            fetch(e.request).catch(() => caches.match(e.request))
        );
        return;
    }

    // 2. כל השאר - Cache First
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});