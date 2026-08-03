// =============================================
// TSHIDI'S FOREVER GARDEN - SERVICE WORKER
// =============================================

const CACHE_NAME = 'tshidi-garden-v5';
const OFFLINE_URL = '/index.html';

// Files to cache - including all MP3s!
const FILES_TO_CACHE = [
    '/',
    '/index.html',
    '/sw.js',
    // Google Fonts
    'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap',
    // MUSIC FILES - ALL YOUR MP3s
    '/music/A_Change_Is_Gonna_Come(128k).mp3',
    '/music/Barry_White_-_My_First_My_Last_My_Everything(..',
    '/music/Breathe(256k).mp3',
    '/music/Daniel_Caesar_&_H.E.R._Best_Part_La_Vissuel(25..',
    '/music/I_Love_You_Love(256k).mp3',
    '/music/Thixo_Mkhuuli(128k).mp3',
    '/music/You_&_I_(Nobody_in_the_World)(256k).mp3'
];

// =============================================
// INSTALL EVENT
// =============================================
self.addEventListener('install', (event) => {
    console.log('📦 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📁 Caching files including MP3s...');
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
    
    // For Google Fonts
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    return response || fetch(request);
                })
        );
        return;
    }
    
    // For MP3 files - cache first for offline playback
    if (url.pathname.includes('/music/') && url.pathname.endsWith('.mp3')) {
        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(request)
                        .then((response) => {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                            return response;
                        });
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
    
    // For everything else - cache first
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
