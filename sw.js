// =============================================
// TSHIDI'S FOREVER GARDEN - SERVICE WORKER
// =============================================

const CACHE_NAME = 'tshidi-garden-v3';
const OFFLINE_URL = '/index.html';

// Files to cache - only index.html since everything is in one file!
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/sw.js',
    // Google Fonts (for offline use)
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap'
];

// =============================================
// INSTALL EVENT
// =============================================
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📁 Caching files...');
                return cache.addAll(FILES_TO_CACHE);
            })
            .then(() => {
                console.log('✅ All files cached!');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Cache installation failed:', error);
            })
    );
});

// =============================================
// ACTIVATE EVENT
// =============================================
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker activating...');
    
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('🗑️ Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('✅ Service Worker activated!');
            return self.clients.claim();
        })
    );
});

// =============================================
// FETCH EVENT
// =============================================
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    
    // For Google Fonts, cache them
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    return response || fetch(request);
                })
        );
        return;
    }
    
    // For HTML requests - network first, fallback to cache
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(OFFLINE_URL)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                return cachedResponse;
                            }
                            return new Response('Offline - Please connect to the internet.', {
                                status: 503,
                                statusText: 'Service Unavailable'
                            });
                        });
                })
        );
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
