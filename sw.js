// =============================================
// TSHIDI'S FOREVER GARDEN - SERVICE WORKER
// =============================================

const CACHE_NAME = 'tshidi-garden-v7';
const OFFLINE_URL = '/index.html';

const CORE_FILES = [
    '/',
    '/index.html',
    '/sw.js',
    '/music/playlist.json'
];

self.addEventListener('install', (event) => {
    console.log('📦 Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            // Cache each core file individually with its own try/catch —
            // never one atomic addAll() — so one bad/renamed URL can't
            // block every other file from being cached.
            await Promise.all(CORE_FILES.map(async (url) => {
                try { await cache.add(url); }
                catch (err) { console.warn('⚠️ Could not cache', url, err); }
            }));
            console.log('✅ Core files cached');

            // Precache every song listed in playlist.json too, so the full
            // playlist is ready offline after just one visit — instead of
            // only caching a track once it's actually been played.
            // Same "individually, never atomic" pattern: a missing/renamed
            // song file just gets skipped with a warning, everything else
            // still caches fine.
            try {
                const manifestRes = await fetch('/music/playlist.json');
                const tracks = await manifestRes.json();
                await Promise.all(tracks.map(async (track) => {
                    const url = encodeURI(`/music/${track.file}`);
                    try { await cache.add(url); console.log('🎵 Cached', track.file); }
                    catch (err) { console.warn('⚠️ Could not cache track', track.file, err); }
                }));
            } catch (err) {
                console.warn('⚠️ Could not read playlist.json to precache songs', err);
            }

            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => Promise.all(
            cacheNames.map((cacheName) => {
                if (cacheWhitelist.indexOf(cacheName) === -1) {
                    console.log('🗑️ Deleting old cache:', cacheName);
                    return caches.delete(cacheName);
                }
            })
        )).then(() => {
            console.log('✅ Service Worker activated!');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(caches.match(request).then((response) => response || fetch(request)));
        return;
    }

    // MP3s: cache-first, then cache whatever is fetched successfully.
    if (url.pathname.includes('/music/') && url.pathname.endsWith('.mp3')) {
        event.respondWith(
            caches.match(request).then((response) => {
                if (response) return response;
                return fetch(request).then((response) => {
                    if (response && response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    }
                    return response;
                }).catch(() => new Response('', { status: 404 }));
            })
        );
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    return response;
                })
                .catch(() => caches.match(OFFLINE_URL).then((cachedResponse) =>
                    cachedResponse || new Response('Offline - Please connect to the internet.', { status: 503, statusText: 'Service Unavailable' })
                ))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(request)
                .then((response) => {
                    if (!response || response.status !== 200) return response;
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
                    return response;
                })
                .catch(() => new Response('Offline - Please connect to the internet.', { status: 503, statusText: 'Service Unavailable' }));
        })
    );
});

self.addEventListener('online', () => {
    self.clients.matchAll().then((clients) => clients.forEach((client) => client.postMessage({ type: 'ONLINE' })));
});

self.addEventListener('offline', () => {
    self.clients.matchAll().then((clients) => clients.forEach((client) => client.postMessage({ type: 'OFFLINE' })));
});
