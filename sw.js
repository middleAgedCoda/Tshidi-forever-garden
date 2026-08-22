// =============================================
// TSHIDI'S FOREVER GARDEN - SERVICE WORKER
// =============================================

const CACHE_NAME = 'tshidi-garden-v13';
const OFFLINE_URL = 'index.html';

const CORE_FILES = [
    './',
    'index.html',
    'sw.js',
    'manifest.json',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'icons/icon-512-maskable.png',
    'music/playlist.json',
    'images/photos.json'
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
                const manifestRes = await fetch('music/playlist.json');
                const tracks = await manifestRes.json();
                await Promise.all(tracks.map(async (track) => {
                    const url = encodeURI(`music/${track.file}`);
                    try { await cache.add(url); console.log('🎵 Cached', track.file); }
                    catch (err) { console.warn('⚠️ Could not cache track', track.file, err); }
                }));
            } catch (err) {
                console.warn('⚠️ Could not read playlist.json to precache songs', err);
            }

            // Same pattern for the photo puzzle images: precache whatever is
            // listed in images/photos.json, skipping anything missing rather
            // than failing the whole install. An empty/missing manifest is
            // fine — the puzzle falls back to generated placeholder art.
            try {
                const photosRes = await fetch('images/photos.json');
                const photos = await photosRes.json();
                await Promise.all(photos.map(async (photo) => {
                    const url = encodeURI(`images/${photo.file}`);
                    try { await cache.add(url); console.log('🧩 Cached', photo.file); }
                    catch (err) { console.warn('⚠️ Could not cache photo', photo.file, err); }
                }));
            } catch (err) {
                console.warn('⚠️ Could not read photos.json to precache images', err);
            }

            return self.skipWaiting();
        }).then(() => {
            // Let any open tabs/app instances know precaching is fully done,
            // so the UI can show a clear "ready for offline" confirmation
            // instead of everyone guessing how long to wait.
            return self.clients.matchAll({ includeUncontrolled: true }).then((clients) => {
                clients.forEach((client) => client.postMessage({ type: 'CACHE_READY' }));
            });
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

    // Serves a cached (or freshly-fetched-and-cached) file while correctly
    // honoring HTTP Range requests, which is required for <audio>/<video>
    // playback to work against Cache API responses.
    async function serveRangeAware(request, url) {
        const cache = await caches.open(CACHE_NAME);
        let fullResponse = await cache.match(url.pathname);
        if (!fullResponse) {
            try {
                // Always fetch the complete file (ignore any incoming Range
                // header) so we cache one full 200 response to slice from,
                // rather than caching partial chunks piecemeal.
                const networkResponse = await fetch(url.pathname);
                if (networkResponse && networkResponse.status === 200) {
                    cache.put(url.pathname, networkResponse.clone());
                    fullResponse = networkResponse;
                } else {
                    return networkResponse || new Response('', { status: 404 });
                }
            } catch (err) {
                return new Response('', { status: 404 });
            }
        }

        const rangeHeader = request.headers.get('range');
        if (!rangeHeader) return fullResponse;

        const buffer = await fullResponse.clone().arrayBuffer();
        const total = buffer.byteLength;
        const match = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
        let start = match && match[1] !== '' ? parseInt(match[1], 10) : 0;
        let end = match && match[2] !== '' ? parseInt(match[2], 10) : total - 1;
        if (isNaN(start) || start < 0) start = 0;
        if (isNaN(end) || end >= total) end = total - 1;
        if (start > end) { start = 0; end = total - 1; }
        const chunk = buffer.slice(start, end + 1);

        const headers = new Headers(fullResponse.headers);
        headers.set('Content-Range', `bytes ${start}-${end}/${total}`);
        headers.set('Content-Length', String(chunk.byteLength));
        headers.set('Accept-Ranges', 'bytes');

        return new Response(chunk, { status: 206, statusText: 'Partial Content', headers });
    }

    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(caches.match(request).then((response) => response || fetch(request)));
        return;
    }

    // Audio (mp3/m4a): cache-first, but Range-request aware. Audio elements
    // request media in byte ranges (for seeking/streaming), not as one plain
    // GET — a cached response returned as-is (ignoring that Range header)
    // gets rejected by the browser's media engine even though the file is
    // fully cached. This slices the cached bytes to match what was actually
    // requested and replies with a proper 206 Partial Content response.
    if (url.pathname.includes('/music/') && /\.(mp3|m4a|wav|ogg)$/i.test(url.pathname)) {
        event.respondWith(serveRangeAware(request, url));
        return;
    }

    // Photos: same cache-first pattern as MP3s above.
    if (url.pathname.includes('/images/') && /\.(jpe?g|png|webp)$/i.test(url.pathname)) {
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
