// =============================================
// TSHIDI'S FOREVER GARDEN - SERVICE WORKER
// =============================================

const CACHE_NAME = 'tshidi-garden-v4';
const OFFLINE_URL = '/index.html';

const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/sw.js',
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // For Google Fonts
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.match(request).then(response => response || fetch(request))
        );
        return;
    }
    
    // For HTML - network first, fallback to cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(OFFLINE_URL))
        );
        return;
    }
    
    // For everything else - cache first
    event.respondWith(
        caches.match(request)
            .then(response => response || fetch(request))
    );
});

// Offline/Online notifications
self.addEventListener('online', () => {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ type: 'ONLINE', message: '🌐 Back Online!' });
        });
    });
});

self.addEventListener('offline', () => {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ type: 'OFFLINE', message: '📴 Offline - Game still works! 🎮' });
        });
    });
});        );
        return;
    }
    
    // For static assets - cache first, fallback to network
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request)
                    .then((response) => {
                        if (!response || response.status !== 200) {
                            return response;
                        }
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(request, responseClone);
                        });
                        return response;
                    })
                    .catch(() => {
                        return new Response('Offline - Please connect to the internet.', {
                            status: 503,
                            statusText: 'Service Unavailable'
                        });
                    });
            })
    );
});

// =============================================
// OFFLINE/ONLINE NOTIFICATIONS
// =============================================
self.addEventListener('online', () => {
    console.log('🌐 App is online');
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'ONLINE',
                message: '🌐 Back Online!'
            });
        });
    });
});

self.addEventListener('offline', () => {
    console.log('📴 App is offline');
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'OFFLINE',
                message: '📴 Offline - Game still works! 🎮'
            });
        });
    });
});
