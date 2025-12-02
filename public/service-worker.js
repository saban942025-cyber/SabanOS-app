const CACHE_NAME = 'saban-bot-v2';
const ASSETS = [
    '/',
    '/index.html',
    '/bot-widget.js',
    '/bot-brain.js',
    '/admin.js',
    '/admin-bot.html'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
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

    // 1. קבצי JSON מ-GitHub - אסטרטגיית Network First (כדי לקבל מידע עדכני)
    if (url.hostname === 'raw.githubusercontent.com') {
        e.respondWith(
            fetch(e.request)
                .then(res => res)
                .catch(() => caches.match(e.request)) // Fallback אם אין אינטרנט
        );
        return;
    }

    // 2. כל שאר הקבצים - Cache First
    e.respondWith(
        caches.match(e.request).then(cached => cached || fetch(e.request))
    );
});